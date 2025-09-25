import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Handlebars from 'handlebars';

import { DatePeriod, DatePeriodFilter, DateUtil, isUnique, PagingQuery } from '@/common';
import { ActionEmailSendSettings } from '@/modules/automation';

import { EntityCategory } from '@/CRM/common';
import { EntityTypeService } from '@/CRM/entity-type/entity-type.service';
import { Entity } from '@/CRM/Model/Entity/Entity';
import { EntityService } from '@/CRM/Service/Entity/EntityService';
import { Mailbox } from '@/Mailing/mailbox/entities';
import { MailboxService as MailboxSettingsService } from '@/Mailing/mailbox/services';
import { MailboxService } from '@/Mailing/Service/Mailbox/MailboxService';
import { FieldType } from '@/modules/entity/entity-field/common';
import { FieldService } from '@/modules/entity/entity-field/field';
import { FieldValueService } from '@/modules/entity/entity-field/field-value';
import { DocumentGenerationService } from '@/modules/documents/document-generation/document-generation.service';

import { MailMessageScheduled } from './entities';
import { CreateMailMessageScheduledDto } from './dto';

interface FindFilter {
  accountId: number;
  messageId?: number | number[];
  mailboxId?: number | number[];
  sendFrom?: number | number[];
  entityId?: number | number[];
  isSent?: boolean;
  sentAt?: DatePeriodFilter;
  createdAt?: DatePeriodFilter;
  subject?: string;
  content?: string;
  sentTo?: string;
}

interface MailboxMessage {
  accountId: number;
  mailboxId: number;
  messageId: number;
}

const DefaultLimit = 1000;

@Injectable()
export class MailMessageScheduledService {
  constructor(
    @InjectRepository(MailMessageScheduled)
    private readonly repository: Repository<MailMessageScheduled>,
    private readonly mailboxSettingsService: MailboxSettingsService,
    private readonly mailboxService: MailboxService,
    private readonly entityTypeService: EntityTypeService,
    private readonly entityService: EntityService,
    private readonly fieldService: FieldService,
    private readonly fieldValueService: FieldValueService,
    private readonly documentGenerationService: DocumentGenerationService,
  ) {}

  async create({
    accountId,
    dto,
  }: {
    accountId: number;
    dto: CreateMailMessageScheduledDto;
  }): Promise<MailMessageScheduled> {
    return this.repository.save(MailMessageScheduled.fromDto(accountId, dto));
  }

  async findOne(filter: FindFilter): Promise<MailMessageScheduled | null> {
    return this.createFindQb(filter).getOne();
  }

  async findMany({ filter, paging }: { filter: FindFilter; paging?: PagingQuery }): Promise<MailMessageScheduled[]> {
    return this.createFindQb(filter).orderBy('created_at', 'DESC').limit(paging.take).offset(paging.skip).getMany();
  }

  async delete(filter: FindFilter): Promise<void> {
    await this.createFindQb(filter).delete().execute();
  }

  async processMessages(): Promise<number> {
    const queue = await this.repository
      .createQueryBuilder()
      .select('account_id', 'accountId')
      .addSelect('mailbox_id', 'mailboxId')
      .addSelect('min(id)', 'messageId')
      .where('sent_at is null')
      .groupBy('account_id')
      .addGroupBy('mailbox_id')
      .getRawMany<MailboxMessage>();

    let processed = 0;
    for (const item of queue) {
      if (item.messageId) {
        if (await this.processMessage(item)) {
          processed++;
        }
      }
    }
    return processed;
  }

  private async processMessage({ accountId, mailboxId, messageId }: MailboxMessage): Promise<boolean> {
    const maxSendAt = await this.repository
      .createQueryBuilder()
      .select('max(sent_at)', 'max')
      .where('account_id = :accountId', { accountId })
      .andWhere(`mailbox_id = :mailboxId`, { mailboxId })
      .andWhere('sent_at is not null')
      .getRawOne<{ sentAt: Date }>();

    const mailbox = await this.mailboxSettingsService.findOne({ accountId, mailboxId });
    if (!maxSendAt?.sentAt || this.canSend({ lastSentAt: maxSendAt.sentAt, limit: mailbox.emailsPerDay })) {
      this.sendMessage({ accountId, mailbox, messageId });
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
    mailbox,
    messageId,
  }: {
    accountId: number;
    mailbox: Mailbox;
    messageId: number;
  }) {
    const message = await this.findOne({ accountId, messageId });

    await this.mailboxService.sendMessageForMailbox(
      accountId,
      mailbox,
      {
        sentTo: message.sendTo,
        subject: message.subject,
        contentText: null,
        contentHtml: message.content,
        entityId: message.entityId,
        cc: null,
        bcc: null,
        replyTo: null,
        replyToMessageId: null,
        fileIds: null,
      },
      null,
      message.sendFrom,
    );

    await this.repository.update({ accountId, id: messageId }, { sentAt: DateUtil.now() });
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
    settings: ActionEmailSendSettings;
  }): Promise<MailMessageScheduled[]> {
    const messages: MailMessageScheduled[] = [];

    const entity = await this.entityService.findOne(accountId, { entityId });
    if (entity && (!entity.stageId || settings.allowAnyStage || entity.stageId === entityStageId)) {
      const hasOptions = Boolean(settings.options);
      if (!hasOptions || settings.options?.main) {
        const entity = await this.entityService.findOne(accountId, { entityId });
        if (entity) {
          const message = await this.createAutomationMessage({
            accountId,
            entity,
            settings,
            onlyFirst: Boolean(settings.options?.main?.onlyFirstValue),
          });
          if (message) {
            messages.push(message);
          }
        }
      }

      let primaryCompany = Boolean(settings.options?.company?.onlyFirstEntity);
      let primaryContact = Boolean(settings.options?.contact?.onlyFirstEntity);
      const entities = await this.entityService.findLinkedEntities({ accountId, entityId });
      for (const entity of entities) {
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
          const message = await this.createAutomationMessage({ accountId, entity, settings, onlyFirst });
          if (message) {
            messages.push(message);
          }
        }
      }
    }

    return messages;
  }

  private async createAutomationMessage({
    accountId,
    entity,
    settings,
    onlyFirst,
  }: {
    accountId: number;
    entity: Entity;
    settings: ActionEmailSendSettings;
    onlyFirst: boolean;
  }): Promise<MailMessageScheduled | null> {
    const fieldIds = await this.fieldService.findManyIds({
      accountId,
      entityTypeId: entity.entityTypeId,
      type: FieldType.Email,
    });
    if (fieldIds.length) {
      let sendTo: string[] = [];
      if (onlyFirst) {
        for (const fieldId of fieldIds) {
          const fieldValue = await this.fieldValueService.findOne({ accountId, entityId: entity.id, fieldId });
          if (fieldValue) {
            const value = fieldValue
              .getValue<string[]>()
              .filter((email) => email !== '')
              .filter(isUnique);
            if (value.length) {
              sendTo = [value[0]];
              break;
            }
          }
        }
      } else {
        const fieldValues = await this.fieldValueService.findMany({
          accountId,
          entityId: entity.id,
          fieldId: fieldIds,
        });
        sendTo = fieldValues
          .map((fv) => fv.getValue<string[]>())
          .flat()
          .filter((email) => email !== '')
          .filter(isUnique);
      }

      if (sendTo.length) {
        const data = await this.documentGenerationService.getDataForGeneration({ accountId, entityId: entity.id });
        data['contact_id'] = entity.id;
        data['contact_name'] = entity.name;
        const subject = Handlebars.compile(settings.subject)(data);
        const content = Handlebars.compile(settings.content + (settings.signature ?? ''))(data);

        return this.create({
          accountId,
          dto: {
            mailboxId: settings.mailboxId,
            sendFrom: settings.userId ?? entity.responsibleUserId,
            subject: subject,
            content: content,
            sendTo: sendTo,
            entityId: entity.id,
          },
        });
      }
    }

    return null;
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

    if (filter?.mailboxId) {
      if (Array.isArray(filter.mailboxId)) {
        qb.andWhere('mailbox_id IN (:...mailboxIds)', { mailboxIds: filter.mailboxId });
      } else {
        qb.andWhere('mailbox_id = :mailboxId', { mailboxId: filter.mailboxId });
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

    if (filter.subject) {
      qb.andWhere('subject ILIKE :subject', { subject: `%${filter.subject}%` });
    }

    if (filter.content) {
      qb.andWhere('content ILIKE :content', { content: `%${filter.content}%` });
    }

    if (filter.sentTo) {
      qb.andWhere('send_to ILIKE :sentTo', { sentTo: `%${filter.sentTo}%` });
    }

    return qb;
  }
}
