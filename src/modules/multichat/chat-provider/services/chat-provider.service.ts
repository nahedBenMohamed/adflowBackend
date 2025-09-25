import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ChatProviderEvent,
  ChatProviderTransport,
  ChatProviderType,
  ChatUserRole,
  MultichatEventType,
} from '../../common';
import { ChatService } from '../../chat/services/chat.service';
import { ChatProviderUserService, ChatProviderUserType } from '../../chat-provider-user';
import { ChatUser, ChatUserExternalDto, ChatUserService } from '../../chat-user';

import { ChatProviderDefaults } from '../const';
import { CreateChatProviderDto, UpdateChatProviderDto } from '../dto';
import { ChatProvider } from '../entities';
import { ExpandableField } from '../types';
import { ChatProviderEntitySettingsService } from './chat-provider-entity-settings.service';

interface FindFilter {
  providerId?: number | number[];
  type?: ChatProviderType;
  transport?: ChatProviderTransport;
}
interface FindOptions {
  expand?: ExpandableField[];
}

@Injectable()
export class ChatProviderService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(ChatProvider)
    private readonly repository: Repository<ChatProvider>,
    private readonly cpUserService: ChatProviderUserService,
    private readonly cpEntitySettingsService: ChatProviderEntitySettingsService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly chatUserService: ChatUserService,
  ) {}

  async create(accountId: number, userId: number, dto: CreateChatProviderDto): Promise<ChatProvider> {
    dto.messagePerDay ??= ChatProviderDefaults.messagePerDay;
    const provider = await this.repository.save(ChatProvider.fromDto(accountId, userId, dto));

    if (dto.accessibleUserIds?.length > 0) {
      provider.accessibleUsers = await this.cpUserService.create(
        accountId,
        provider.id,
        dto.accessibleUserIds,
        ChatProviderUserType.Accessible,
      );
    }
    if (dto.responsibleUserIds?.length > 0) {
      provider.responsibleUsers = await this.cpUserService.create(
        accountId,
        provider.id,
        dto.responsibleUserIds,
        ChatProviderUserType.Responsible,
      );
    }
    if (dto.supervisorUserIds?.length > 0) {
      provider.supervisorUsers = await this.cpUserService.create(
        accountId,
        provider.id,
        dto.supervisorUserIds,
        ChatProviderUserType.Supervisor,
      );
    }
    if (dto.entitySettings) {
      provider.entitySettings = await this.cpEntitySettingsService.create({
        accountId,
        providerId: provider.id,
        dto: dto.entitySettings,
      });
    }

    this.eventEmitter.emit(
      MultichatEventType.ChatProviderCreated,
      new ChatProviderEvent({ accountId, userId, providerId: provider.id, status: provider.status }),
    );

    return provider;
  }

  async findOne(
    accountId: number,
    userId: number | null,
    filter?: FindFilter,
    options?: FindOptions,
  ): Promise<ChatProvider | null> {
    const provider = await this.createFindQb(accountId, filter).getOne();

    const expandedProvider =
      provider && options?.expand ? await this.expandOne(accountId, userId, provider, options.expand) : provider;

    if (userId) {
      const accessibleUsers =
        expandedProvider.accessibleUsers ||
        (await this.cpUserService.findMany(accountId, {
          providerId: provider.id,
          type: ChatProviderUserType.Accessible,
        }));

      return !accessibleUsers || accessibleUsers.length === 0 || accessibleUsers.some((u) => u.userId === userId)
        ? expandedProvider
        : null;
    } else {
      return expandedProvider;
    }
  }

  async findMany(
    accountId: number,
    userId: number | null,
    filter?: FindFilter,
    options?: FindOptions,
  ): Promise<ChatProvider[]> {
    const providers = await this.createFindQb(accountId, filter).orderBy('cp.created_at').getMany();
    const expandedProviders =
      providers && options?.expand ? await this.expandMany(accountId, userId, providers, options.expand) : providers;

    if (userId) {
      const filteredProviders: ChatProvider[] = [];
      for (const provider of expandedProviders) {
        const accessibleUsers =
          provider.accessibleUsers ||
          (await this.cpUserService.findMany(accountId, {
            providerId: provider.id,
            type: ChatProviderUserType.Accessible,
          }));
        if (!accessibleUsers || accessibleUsers.length === 0 || accessibleUsers.some((u) => u.userId === userId)) {
          filteredProviders.push(provider);
        }
      }
      return filteredProviders;
    } else {
      return expandedProviders;
    }
  }

  async update(
    accountId: number,
    userId: number | null,
    providerId: number,
    dto: UpdateChatProviderDto,
  ): Promise<ChatProvider> {
    const provider: ChatProvider = await this.findOne(
      accountId,
      userId,
      { providerId },
      { expand: ['accessibleUsers', 'responsibleUsers', 'supervisorUsers', 'entitySettings'] },
    );

    await this.repository.save(provider.update(dto));

    if (dto.accessibleUserIds) {
      provider.accessibleUsers = await this.cpUserService.update(
        accountId,
        provider.id,
        provider.accessibleUsers,
        dto.accessibleUserIds,
        ChatProviderUserType.Accessible,
      );
    }
    if (dto.responsibleUserIds) {
      provider.responsibleUsers = await this.cpUserService.update(
        accountId,
        provider.id,
        provider.responsibleUsers,
        dto.responsibleUserIds,
        ChatProviderUserType.Responsible,
      );
    }
    if (dto.supervisorUserIds) {
      provider.supervisorUsers = await this.cpUserService.update(
        accountId,
        provider.id,
        provider.supervisorUsers,
        dto.supervisorUserIds,
        ChatProviderUserType.Supervisor,
      );
    }

    if (dto.entitySettings === null) {
      await this.cpEntitySettingsService.delete({ accountId, providerId: provider.id });
      provider.entitySettings = null;
    } else if (dto.entitySettings) {
      provider.entitySettings = await this.cpEntitySettingsService.update({
        accountId,
        providerId: provider.id,
        dto: dto.entitySettings,
      });
    }

    this.eventEmitter.emit(
      MultichatEventType.ChatProviderUpdated,
      new ChatProviderEvent({ accountId, userId, providerId: provider.id, status: provider.status }),
    );

    return provider;
  }

  async delete({ accountId, userId, providerId }: { accountId: number; userId: number; providerId: number }) {
    await this.repository.delete({ accountId, id: providerId });

    this.eventEmitter.emit(
      MultichatEventType.ChatProviderDeleted,
      new ChatProviderEvent({ accountId, userId, providerId }),
    );
  }

  async getChatUserExternal({
    accountId,
    providerId,
    chatExternalId,
    externalUserDto,
  }: {
    accountId: number;
    providerId: number;
    chatExternalId: string;
    externalUserDto: ChatUserExternalDto;
  }): Promise<ChatUser | null> {
    const chat = await this.chatService.findOne({
      accountId,
      filter: { providerId, externalId: chatExternalId },
    });
    if (chat) {
      const chatUser = await this.chatUserService.findOne(accountId, {
        providerId,
        chatId: chat.id,
        role: ChatUserRole.EXTERNAL,
      });
      if (chatUser) {
        return chatUser;
      } else {
        const [newUser] = await this.chatUserService.addUsers({
          accountId,
          chatId: chat.id,
          externalUsers: [externalUserDto],
        });
        return newUser;
      }
    } else {
      const newChat = await this.chatService.createExternalChat(accountId, null, {
        providerId: providerId,
        externalId: chatExternalId,
        title: `${externalUserDto.firstName} ${externalUserDto.lastName}`.trim(),
        externalUser: externalUserDto,
      });

      return newChat.users.find((u) => u.externalUser?.externalId === externalUserDto.externalId);
    }
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder('cp').where('cp.account_id = :accountId', { accountId });

    if (filter?.providerId) {
      if (Array.isArray(filter.providerId)) {
        qb.andWhere('cp.id IN (:...ids)', { ids: filter.providerId });
      } else {
        qb.andWhere('cp.id = :id', { id: filter.providerId });
      }
    }

    if (filter?.type) {
      qb.andWhere('cp.type = :type', { type: filter.type });
    }

    if (filter?.transport) {
      qb.andWhere('cp.transport = :transport', { transport: filter.transport });
    }

    return qb;
  }

  private async expandOne(
    accountId: number,
    userId: number | null,
    provider: ChatProvider,
    expand: ExpandableField[],
  ): Promise<ChatProvider> {
    if (userId && expand.includes('unseenCount')) {
      provider.unseenCount = await this.chatService.getUnseenForUser(accountId, userId, provider.id);
    }

    if (expand.includes('accessibleUsers')) {
      provider.accessibleUsers = await this.cpUserService.findMany(accountId, {
        providerId: provider.id,
        type: ChatProviderUserType.Accessible,
      });
    }

    if (expand.includes('responsibleUsers')) {
      provider.responsibleUsers = await this.cpUserService.findMany(accountId, {
        providerId: provider.id,
        type: ChatProviderUserType.Responsible,
      });
    }

    if (expand.includes('supervisorUsers')) {
      provider.supervisorUsers = await this.cpUserService.findMany(accountId, {
        providerId: provider.id,
        type: ChatProviderUserType.Supervisor,
      });
    }

    if (expand.includes('entitySettings')) {
      provider.entitySettings = await this.cpEntitySettingsService.findOne({
        accountId,
        providerId: provider.id,
      });
    }

    return provider;
  }
  private async expandMany(
    accountId: number,
    userId: number | null,
    providers: ChatProvider[],
    expand: ExpandableField[],
  ): Promise<ChatProvider[]> {
    return Promise.all(providers.map((provider) => this.expandOne(accountId, userId, provider, expand)));
  }
}
