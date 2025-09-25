import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Handlebars from 'handlebars';

import { DatePeriod, DatePeriodFilter, DateUtil, isUnique, PagingQuery } from '@/common';
import { AccountService } from '@/modules/iam/account/account.service';
import { UserService } from '@/modules/iam/user/user.service';
import { ActionChatSendSettings } from '@/modules/automation';
import { EntityCategory } from '@/CRM/common';
import { EntityTypeService } from '@/CRM/entity-type/entity-type.service';
import { Entity } from '@/CRM/Model/Entity/Entity';
import { EntityService } from '@/CRM/Service/Entity/EntityService';
import { FieldType } from '@/modules/entity/entity-field/common';
import { FieldService } from '@/modules/entity/entity-field/field';
import { FieldValueService } from '@/modules/entity/entity-field/field-value';
import { DocumentGenerationService } from '@/modules/documents/document-generation/document-generation.service';

import { ChatService } from '../chat/services';
import { ChatMessageService } from '../chat-message/services';
import { ChatProvider, ChatProviderService } from '../chat-provider';
import { ChatUserService } from '../chat-user';
import { ChatProviderProxyService } from '../providers/chat-provider-proxy.service';

import { ChatMessageScheduled } from './entities';
import { CreateChatMessageScheduledDto } from './dto';

interface FindFilter {
  accountId: number;
  messageId?: number | number[];
  providerId?: number | number[];
  sendFrom?: number | number[];
  entityId?: number | number[];
  isSent?: boolean;
  sentAt?: DatePeriodFilter;
  createdAt?: DatePeriodFilter;
  message?: string;
  sentTo?: string;
}

interface ProviderMessage {
  accountId: number;
  providerId: number;
  messageId: number;
}

const DefaultLimit = 10;

@Injectable()
export class ChatMessageScheduledService {
  private readonly logger = new Logger(ChatMessageScheduledService.name);

  constructor(
    @InjectRepository(ChatMessageScheduled)
    private readonly repository: Repository<ChatMessageScheduled>,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly entityTypeService: EntityTypeService,
    private readonly entityService: EntityService,
    private readonly fieldService: FieldService,
    private readonly fieldValueService: FieldValueService,
    private readonly chatProviderProxyService: ChatProviderProxyService,
    private readonly chatProviderService: ChatProviderService,
    private readonly chatUserService: ChatUserService,
    private readonly chatService: ChatService,
    private readonly chatMessageService: ChatMessageService,
    private readonly documentGenerationService: DocumentGenerationService,
  ) {}

  async create({
    accountId,
    dto,
  }: {
    accountId: number;
    dto: CreateChatMessageScheduledDto;
  }): Promise<ChatMessageScheduled> {
    return this.repository.save(ChatMessageScheduled.fromDto(accountId, dto));
  }

  async findOne(filter: FindFilter): Promise<ChatMessageScheduled | null> {
    return this.createFindQb(filter).getOne();
  }

  async findMany({ filter, paging }: { filter: FindFilter; paging?: PagingQuery }): Promise<ChatMessageScheduled[]> {
    return this.createFindQb(filter).orderBy('created_at', 'DESC').limit(paging.take).offset(paging.skip).getMany();
  }

  async delete(filter: FindFilter): Promise<void> {
    await this.createFindQb(filter).delete().execute();
  }

  async processMessages(): Promise<number> {
    const queue = await this.repository
      .createQueryBuilder()
      .select('account_id', 'accountId')
      .addSelect('provider_id', 'providerId')
      .addSelect('min(id)', 'messageId')
      .where('sent_at is null')
      .groupBy('account_id')
      .addGroupBy('provider_id')
      .getRawMany<ProviderMessage>();

    return (await Promise.all(queue.map(async (item) => item.messageId && (await this.processMessage(item))))).filter(
      Boolean,
    ).length;
  }

  async processAutomation({
    accountId,
    entityId,
    entityStageId,
    settings,
  }: {
    accountId: number;
    entityId: number;
    entityStageId: number | null | undefined;
    settings: ActionChatSendSettings;
  }): Promise<ChatMessageScheduled[]> {
    const messages: ChatMessageScheduled[] = [];

    const entity = await this.entityService.findOne(accountId, { entityId });
    if (entity && (!entity.stageId || settings.allowAnyStage || entity.stageId === entityStageId)) {
      const hasOptions = Boolean(settings.options);
      if (!hasOptions || settings.options?.main) {
        const mainMessage = await this.createAutomationMessage({
          accountId,
          entity,
          settings,
          onlyFirst: Boolean(settings.options?.main?.onlyFirstValue),
        });
        if (mainMessage) messages.push(mainMessage);
      }

      let primaryCompany = Boolean(settings.options?.company?.onlyFirstEntity);
      let primaryContact = Boolean(settings.options?.contact?.onlyFirstEntity);
      const entities = await this.entityService.findLinkedEntities({ accountId, entityId });

      const messagePromises = entities.map(async (entity) => {
        const entityType = await this.entityTypeService.findOne(accountId, { id: entity.entityTypeId });
        let send = [EntityCategory.CONTACT, EntityCategory.COMPANY].includes(entityType.entityCategory);
        let onlyFirst = false;

        if (send && hasOptions) {
          if (entityType.entityCategory === EntityCategory.COMPANY) {
            send = settings.options.company && (!settings.options.company?.onlyFirstEntity || primaryCompany);
            primaryCompany = false;
            onlyFirst = Boolean(settings.options.company?.onlyFirstValue);
          } else if (entityType.entityCategory === EntityCategory.CONTACT) {
            send = settings.options.contact && (!settings.options.contact?.onlyFirstEntity || primaryContact);
            primaryContact = false;
            onlyFirst = Boolean(settings.options.contact?.onlyFirstValue);
          }
        }

        if (send) {
          return this.createAutomationMessage({ accountId, entity, settings, onlyFirst });
        }
        return null;
      });

      messages.push(...(await Promise.all(messagePromises)).filter(Boolean));

      if (settings.phoneNumbers?.length) {
        const messagePromises = settings.phoneNumbers
          .filter(isUnique)
          .map((phoneNumber) => this.createAutomationMessage({ accountId, entity, settings, phoneNumber }));
        messages.push(...(await Promise.all(messagePromises)).filter(Boolean));
      }
    }
    return messages;
  }

  private async processMessage({ accountId, providerId, messageId }: ProviderMessage): Promise<boolean> {
    const maxSendAt = await this.repository
      .createQueryBuilder()
      .select('max(sent_at)', 'max')
      .where('account_id = :accountId', { accountId })
      .andWhere(`provider_id = :providerId`, { providerId })
      .andWhere('sent_at is not null')
      .getRawOne<{ sentAt: Date }>();

    const provider = await this.chatProviderService.findOne(accountId, null, { providerId });
    if (!maxSendAt?.sentAt || this.canSend({ lastSentAt: maxSendAt.sentAt, limit: provider.messagePerDay })) {
      this.sendMessage({ accountId, provider, messageId });
      return true;
    }
    return false;
  }

  private canSend({ lastSentAt, limit }: { lastSentAt: Date; limit?: number | null }): boolean {
    const secondsPerEmail = 86400 / (limit ?? DefaultLimit);
    const diff = DateUtil.diff({ startDate: lastSentAt, endDate: DateUtil.now(), unit: 'second' });

    return diff > secondsPerEmail;
  }

  private async sendMessage({
    accountId,
    provider,
    messageId,
  }: {
    accountId: number;
    provider: ChatProvider;
    messageId: number;
  }) {
    const message = await this.findOne({ accountId, messageId });

    if (message?.entityId) {
      const chatIds = await this.getChatId({ accountId, userId: message.sendFrom, provider, message });
      if (chatIds.length) {
        const account = await this.accountService.findOne({ accountId });
        const user = await this.userService.findOne({ accountId, id: message.sendFrom });

        await Promise.all(
          chatIds.map(async (chatId) => {
            try {
              await this.chatMessageService.create(account, user, chatId, { text: message.message });
            } catch (e) {
              this.logger.warn(`Send scheduled message with id ${messageId} error: ${e.toString()}`);
            }
          }),
        );
      }
    } else if (message.phoneNumber) {
      await this.chatProviderProxyService.sendDirectMessage({
        accountId,
        provider,
        phone: message.phoneNumber,
        message: message.message,
      });
    }

    await this.repository.update({ accountId, id: messageId }, { sentAt: DateUtil.now() });
  }

  private async getChatId({
    accountId,
    userId,
    provider,
    message,
  }: {
    accountId: number;
    userId: number;
    provider: ChatProvider;
    message: ChatMessageScheduled;
  }): Promise<number[]> {
    const chats = await this.chatService.findMany({
      accountId,
      filter: { providerId: message.providerId, entityId: message.entityId },
    });
    if (chats.length) {
      return !message.onlyFirst ? chats.map((c) => c.id) : [chats[0].id];
    } else if (provider.canSendByPhone()) {
      const entity = await this.entityService.findOne(accountId, { entityId: message.entityId });
      const phones = await this.getPhones({ accountId, entity, onlyFirst: message.onlyFirst });
      const chatIds: number[] = [];
      for (const phone of phones) {
        const externalChatUser = await this.chatUserService.findOne(accountId, {
          providerId: provider.id,
          externalId: phone,
        });
        if (externalChatUser) {
          await this.chatUserService.addUsers({ accountId, chatId: externalChatUser.chatId, userIds: [userId] });

          chatIds.push(externalChatUser.chatId);
        } else {
          const chat = await this.chatService.createExternalChat(accountId, userId, {
            providerId: provider.id,
            title: entity.name,
            entityId: entity.id,
            externalUser: {
              firstName: entity.name,
              externalId: phone,
              phone: phone,
            },
          });

          chatIds.push(chat.id);
        }
      }

      return chatIds;
    }

    return [];
  }

  private async getPhones({
    accountId,
    entity,
    onlyFirst,
  }: {
    accountId: number;
    entity: Entity;
    onlyFirst: boolean;
  }): Promise<string[]> {
    const fieldIds = await this.fieldService.findManyIds({
      accountId,
      entityTypeId: entity.entityTypeId,
      type: FieldType.Phone,
    });
    if (fieldIds.length) {
      if (onlyFirst) {
        for (const fieldId of fieldIds) {
          const fieldValue = await this.fieldValueService.findOne({ accountId, entityId: entity.id, fieldId });
          if (fieldValue) {
            const value = fieldValue
              .getValue<string[]>()
              .filter((fv) => fv !== '')
              .filter(isUnique);
            if (value.length) {
              return [value[0]];
            }
          }
        }
      } else {
        const fieldValues = await this.fieldValueService.findMany({
          accountId,
          entityId: entity.id,
          fieldId: fieldIds,
        });
        return fieldValues
          .map((fv) => fv.getValue<string[]>())
          .flat()
          .filter((fv) => fv !== '')
          .filter(isUnique);
      }
    }

    return [];
  }

  private async createAutomationMessage({
    accountId,
    entity,
    settings,
    onlyFirst = false,
    phoneNumber,
  }: {
    accountId: number;
    entity: Entity;
    settings: ActionChatSendSettings;
    onlyFirst?: boolean;
    phoneNumber?: string;
  }): Promise<ChatMessageScheduled> {
    const data = await this.documentGenerationService.getDataForGeneration({ accountId, entityId: entity.id });
    data['contact_name'] = entity.name;
    const message = Handlebars.compile(settings.message)(data);

    return this.create({
      accountId,
      dto: {
        providerId: settings.providerId,
        sendFrom: settings.userId ?? entity.responsibleUserId,
        message,
        entityId: !phoneNumber ? entity.id : undefined,
        phoneNumber,
        onlyFirst,
      },
    });
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository.createQueryBuilder().where('account_id = :accountId', { accountId: filter.accountId });

    if (filter?.messageId) {
      if (Array.isArray(filter.messageId)) {
        qb.andWhere('id IN (:...ids)', { ids: filter.messageId });
      } else {
        qb.andWhere('id = :id', { id: filter.messageId });
      }
    }

    if (filter?.providerId) {
      if (Array.isArray(filter.providerId)) {
        qb.andWhere('provider_id IN (:...providerIds)', { providerIds: filter.providerId });
      } else {
        qb.andWhere('provider_id = :providerId', { providerId: filter.providerId });
      }
    }

    if (filter?.sendFrom) {
      if (Array.isArray(filter.sendFrom)) {
        qb.andWhere('send_from IN (:...sendFrom)', { sendFrom: filter.sendFrom });
      } else {
        qb.andWhere('send_from = :sendFrom', { sendFrom: filter.sendFrom });
      }
    }

    if (filter?.entityId) {
      if (Array.isArray(filter.entityId)) {
        qb.andWhere('entity_id IN (:...entityIds)', { entityIds: filter.entityId });
      } else {
        qb.andWhere('entity_id = :entityId', { entityId: filter.entityId });
      }
    }

    if (filter?.isSent !== undefined) {
      if (filter.isSent) {
        qb.andWhere('sent_at IS NOT NULL');
      } else {
        qb.andWhere('sent_at IS NULL');
      }
    }

    if (filter.sentAt) {
      const dates = DatePeriod.fromFilter(filter.sentAt);
      if (dates.from) {
        qb.andWhere('sent_at >= :sentAtFrom', { sentAtFrom: dates.from });
      }
      if (dates.to) {
        qb.andWhere('sent_at <= :sentAtTo', { sentAtTo: dates.to });
      }
    }

    if (filter.createdAt) {
      const dates = DatePeriod.fromFilter(filter.createdAt);
      if (dates.from) {
        qb.andWhere('created_at >= :createdAtFrom', { createdAtFrom: dates.from });
      }
      if (dates.to) {
        qb.andWhere('created_at <= :createdAtTo', { createdAtTo: dates.to });
      }
    }

    if (filter.message) {
      qb.andWhere('message ILIKE :content', { content: `%${filter.message}%` });
    }

    if (filter.sentTo) {
      qb.andWhere('send_to ILIKE :sentTo', { sentTo: `%${filter.sentTo}%` });
    }

    return qb;
  }
}
