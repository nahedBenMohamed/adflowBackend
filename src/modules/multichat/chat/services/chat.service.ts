import Handlebars from 'handlebars';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type SelectQueryBuilder } from 'typeorm';

import {
  BadRequestError,
  CursorPagingQuery,
  ForbiddenError,
  NotFoundError,
  PagingMeta,
  type PagingQuery,
} from '@/common';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { AccountService } from '@/modules/iam/account/account.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { UserService } from '@/modules/iam/user/user.service';
import { FieldType } from '@/modules/entity/entity-field/common/enums/field-type.enum';
import { EntityInfoService } from '@/modules/entity/entity-info/entity-info.service';
import { ActionChatSendAmworkSettings } from '@/modules/automation';
import { EntityService } from '@/CRM/Service/Entity/EntityService';
import { DocumentGenerationService } from '@/modules/documents/document-generation/document-generation.service';

import {
  ChatEvent,
  ChatMessageStatus,
  ChatProviderTransport,
  ChatType,
  ChatUserRole,
  MultichatEventType,
} from '../../common';
import { ChatUser, ChatUserExternalDto, ChatUserService } from '../../chat-user';
import { ChatMessageUserStatus } from '../../chat-message/entities/chat-message-user-status.entity';
import { ChatMessage } from '../../chat-message/entities/chat-message.entity';
import { ChatMessageService } from '../../chat-message/services/chat-message.service';
import { ChatProviderService } from '../../chat-provider/services/chat-provider.service';
import { ChatProviderProxyService } from '../../providers/chat-provider-proxy.service';

import {
  CreatePersonalChatDto,
  CreateGroupChatDto,
  CreateExternalChatDto,
  UpdateGroupChatDto,
  FindChatsFullResultDto,
  ChatFindPersonalFilterDto,
  ChatFindByMessageContentFilterDto,
  CreateContactLeadDto,
} from '../dto';
import { Chat, ChatPinnedMessage } from '../entities';
import { ChatPinnedMessageService } from './chat-pinned-message.service';

const LAST_MESSAGE = 'select cm.id from chat_message cm where cm.chat_id = chat.id order by cm.created_at desc limit 1';

interface FindFilter {
  chatId?: number;
  type?: ChatType;
  entityId?: number;
  phoneNumber?: string;
  externalId?: string;
  providerId?: number | number[];
  transport?: ChatProviderTransport;
  title?: string;
}

interface ChatUpdateData {
  externalId?: string;
}

@Injectable()
export class ChatService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Chat)
    private readonly repository: Repository<Chat>,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => EntityService))
    private readonly entityService: EntityService,
    private readonly entityInfoService: EntityInfoService,
    private readonly chatUserService: ChatUserService,
    private readonly chatPinnedMessageService: ChatPinnedMessageService,
    @Inject(forwardRef(() => ChatMessageService))
    private readonly chatMessageService: ChatMessageService,
    @Inject(forwardRef(() => ChatProviderService))
    private readonly chatProviderService: ChatProviderService,
    private readonly providerProxyService: ChatProviderProxyService,
    @Inject(forwardRef(() => DocumentGenerationService))
    private readonly documentGenerationService: DocumentGenerationService,
  ) {}

  async createPersonalChat(accountId: number, user: User, dto: CreatePersonalChatDto): Promise<Chat> {
    const currentChat = await this.createFindQb(accountId, null, {
      type: ChatType.PERSONAL,
      providerId: dto.providerId,
    })
      .innerJoin(ChatUser, 'cu1', 'cu1.chat_id = chat.id and cu1.user_id = :user1Id', { user1Id: user.id })
      .innerJoin(ChatUser, 'cu2', 'cu2.chat_id = chat.id and cu2.user_id = :user2Id', { user2Id: dto.companionId })
      .getOne();

    if (currentChat) {
      return this.getChatFull(accountId, user, currentChat.id);
    }

    const chat = await this.repository.save(Chat.personalFromDto(accountId, user.id, dto));
    chat.users = await this.chatUserService.createForChat(accountId, chat.id, {
      ownerIds: [chat.createdBy, dto.companionId],
    });
    chat.hasAccess = true;

    this.notifyChatUsers(accountId, chat, MultichatEventType.ChatCreated, user.id);

    return chat;
  }

  async createGroupChat(accountId: number, user: User | null, dto: CreateGroupChatDto): Promise<Chat> {
    if (dto.entityId) {
      const currentChat = await this.findOne({
        accountId,
        filter: { type: ChatType.GROUP, providerId: dto.providerId, entityId: dto.entityId },
      });

      if (currentChat) {
        const chat = await this.getChatFull(accountId, user, currentChat.id, false);
        const addedUsers = await this.chatUserService.addUsers({ accountId, chatId: chat.id, userIds: [user.id] });
        if (addedUsers.length) {
          if (chat.users) {
            chat.users.push(...addedUsers);
          } else {
            chat.users = addedUsers;
          }
        }
        chat.hasAccess = true;
        return chat;
      }
    }

    const chat = await this.repository.save(Chat.groupFromDto(accountId, user.id, dto));

    chat.users = await this.chatUserService.createForChat(accountId, chat.id, {
      ownerIds: [user.id],
      userIds: dto.participantIds,
    });
    chat.hasAccess = true;

    this.notifyChatUsers(accountId, chat, MultichatEventType.ChatCreated, user.id);

    return chat;
  }

  async createExternalChat(accountId: number, userId: number | null, dto: CreateExternalChatDto): Promise<Chat> {
    if (!dto.externalId) {
      dto.externalId = await this.providerProxyService.createChatExternalId(
        accountId,
        dto.providerId,
        dto.externalUser.externalId,
      );
    }

    const currentChat = await this.findOne({
      accountId,
      filter: { type: ChatType.GROUP, providerId: dto.providerId, externalId: dto.externalId },
    });

    if (currentChat) {
      const chat = await this.getChatFull(accountId, null, currentChat.id, false);
      if (userId) {
        const addedUsers = await this.chatUserService.addUsers({ accountId, chatId: chat.id, userIds: [userId] });
        if (addedUsers.length) {
          if (chat.users) {
            chat.users.push(...addedUsers);
          } else {
            chat.users = addedUsers;
          }
        }
      }
      chat.hasAccess = true;
      return chat;
    } else {
      const chat = await this.repository.save(Chat.externalFromDto(accountId, userId, dto));
      const provider = await this.chatProviderService.findOne(
        accountId,
        null,
        { providerId: dto.providerId },
        { expand: ['responsibleUsers', 'supervisorUsers', 'entitySettings'] },
      );
      const participantIds =
        dto.participantIds?.length > 0 ? dto.participantIds : provider.responsibleUsers.map((u) => u.userId);
      const supervisorIds = provider.supervisorUsers.map((u) => u.userId);
      dto.externalUser.phone = dto.externalUser.phone?.startsWith('+')
        ? dto.externalUser.phone.slice(1)
        : dto.externalUser.phone;
      chat.users = await this.chatUserService.createForChat(accountId, chat.id, {
        ownerIds: userId ? [userId] : participantIds,
        userIds: participantIds,
        supervisorIds: supervisorIds,
        externalUsers: [dto.externalUser],
      });
      chat.hasAccess = true;

      if (!dto.entityId && provider.entitySettings) {
        const user = await this.userService.findOne({
          accountId,
          id: provider.entitySettings.ownerId ?? userId ?? provider.createdBy,
        });
        const entity = await this.createLinkedEntities({
          accountId,
          user,
          chatId: chat.id,
          dto: {
            contactTypeId: provider.entitySettings.contactEntityTypeId,
            leadTypeId: provider.entitySettings.leadEntityTypeId,
            leadBoardId: provider.entitySettings.leadBoardId,
            leadStageId: provider.entitySettings.leadStageId,
            leadName: provider.entitySettings.leadName,
            ownerId: provider.entitySettings.ownerId,
            checkActiveLead: provider.entitySettings.checkActiveLead,
            checkDuplicate: provider.entitySettings.checkDuplicate,
          },
        });
        if (entity) {
          chat.entityId = entity.id;
        }
      }

      this.notifyChatUsers(accountId, chat, MultichatEventType.ChatCreated, userId);

      return chat;
    }
  }

  async updateExternalId(accountId: number, chatId: number, { externalId }: ChatUpdateData) {
    const chat = await this.findOne({ accountId, filter: { chatId } });
    if (chat) {
      if (externalId !== undefined) {
        chat.externalId = externalId;
      }

      await this.repository.save(chat);
    }
  }

  async mergeChat(account: Account, fromChatId: number, toChatId: number) {
    const fromChat = await this.findOne({ accountId: account.id, filter: { chatId: fromChatId } });
    fromChat.users = await this.chatUserService.findMany(account.id, { chatId: fromChatId });
    const toChat = await this.findOne({ accountId: account.id, filter: { chatId: toChatId } });
    toChat.users = await this.chatUserService.findMany(account.id, { chatId: toChatId });

    const fromChatInternalUsers = fromChat.users.filter((u) => u.userId);
    const toChatInternalUsers = toChat.users.filter((u) => u.userId);
    const addInternalUsers = fromChatInternalUsers.filter(
      (fu) => !toChatInternalUsers.some((tu) => tu.userId === fu.userId),
    );

    const fromChatExternalUsers = fromChat.users.filter((u) => u.role === ChatUserRole.EXTERNAL);
    const toChatExternalUsers = toChat.users.filter((u) => u.role === ChatUserRole.EXTERNAL);
    const addExternalUsers = fromChatExternalUsers.filter(
      (fu) =>
        !(
          toChatExternalUsers.some((tu) => tu.externalUser.externalId === fu.externalUser.externalId) ||
          toChatExternalUsers.some((tu) => tu.externalUser.phone === fu.externalUser.phone)
        ),
    );

    if (addInternalUsers.length > 0 || addExternalUsers.length > 0) {
      const addUsers = await this.chatUserService.addUsers({
        accountId: account.id,
        chatId: toChatId,
        userIds: addInternalUsers.map((iu) => iu.userId),
        externalUsers: addExternalUsers.map(
          (eu) =>
            new ChatUserExternalDto(
              eu.externalUser.externalId,
              eu.externalUser.firstName,
              eu.externalUser.lastName,
              eu.externalUser.avatarUrl,
              eu.externalUser.phone,
              eu.externalUser.email,
              eu.externalUser.link,
            ),
        ),
      });
      toChat.users.push(...addUsers);
    }

    //TODO; merge messages
    const messages = await this.chatMessageService.findMany(
      account.id,
      { chatId: fromChatId },
      { expand: ['chatUser'] },
    );
    for (const message of messages) {
      const toChatUser = message.chatUser.userId
        ? toChat.users.find((u) => u.userId === message.chatUser.userId)
        : toChat.users.find(
            (u) =>
              u.externalUser?.externalId === message.chatUser.externalUser.externalId ||
              u.externalUser?.phone === message.chatUser.externalUser.phone,
          );
      if (toChatUser.userId) {
        const user = await this.userService.findOne({ accountId: account.id, id: toChatUser.userId });
        await this.chatMessageService.create(account, user, toChat.id, { text: message.text }, false);
      } else if (toChatUser.externalUser) {
        await this.chatMessageService.createExternal(
          account,
          toChatUser,
          message.text,
          message.externalId,
          null,
          false,
        );
      }
    }
    await this.delete(account.id, null, fromChatId);
  }

  async updateGroupChat(accountId: number, user: User, chatId: number, dto: UpdateGroupChatDto): Promise<Chat> {
    const chat = await this.getChatFull(accountId, user, chatId);

    if (chat.type !== ChatType.GROUP) {
      throw NotFoundError.withId(Chat, chatId);
    }

    if (dto.participantIds) {
      chat.users = await this.chatUserService.updateForGroupChat(
        accountId,
        chat.id,
        chat.createdBy,
        chat.users,
        dto.participantIds,
      );
    }

    if (dto.entityId) {
      chat.entityId = dto.entityId;
    }
    if (dto.title) {
      chat.title = dto.title;
    }
    await this.repository.save(chat);

    this.notifyChatUsers(accountId, chat, MultichatEventType.ChatUpdated, user.id);

    return chat;
  }

  async pinMessage(accountId: number, user: User, chatId: number, messageId: number): Promise<Chat> {
    const chat = await this.getChatFull(accountId, user, chatId);

    const message = await this.chatMessageService.getMessageSimple(accountId, chatId, messageId);
    await this.chatPinnedMessageService.pinMessage(accountId, chat.id, message.id);
    chat.pinnedMessages = [message, ...chat.pinnedMessages.filter((msg) => msg.id !== message.id)];

    this.notifyChatUsers(accountId, chat, MultichatEventType.ChatUpdated, user.id);

    return chat;
  }

  async unpinMessage(accountId: number, user: User, chatId: number, messageId: number): Promise<Chat> {
    const chat = await this.getChatFull(accountId, user, chatId);

    const message = await this.chatMessageService.getMessageSimple(accountId, chatId, messageId);
    await this.chatPinnedMessageService.unpinMessage(accountId, chat.id, message.id);
    chat.pinnedMessages = chat.pinnedMessages.filter((msg) => msg.id !== message.id);

    this.notifyChatUsers(accountId, chat, MultichatEventType.ChatUpdated, user.id);

    return chat;
  }

  async updateMessagesStatus({
    accountId,
    user,
    chatId,
    status,
  }: {
    accountId: number;
    user: User;
    chatId?: number;
    status: ChatMessageStatus;
  }) {
    await this.chatMessageService.updateStatusDirect({ accountId, user, chatId, status });
  }

  async delete(accountId: number, userId: number | null, chatId: number): Promise<number | null> {
    const chat = await this.findOne({ accountId, filter: { chatId } });

    if (chat) {
      const chatUser = userId ? await this.chatUserService.findOne(accountId, { chatId, userId }) : null;

      if (userId && (!chatUser || chatUser.role === ChatUserRole.USER)) {
        throw new ForbiddenError(`User ${userId} can not delete chat ${chatId}`);
      }

      await this.notifyChatUsers(accountId, chat, MultichatEventType.ChatDeleted, userId);
      await this.repository.delete(chatId);

      return chatId;
    }

    return null;
  }

  async findOne({
    accountId,
    filter,
    accessUserId,
  }: {
    accountId: number;
    filter: FindFilter;
    accessUserId?: number;
  }): Promise<Chat> {
    const chat = await this.createFindQb(accountId, null, filter).getOne();
    if (accessUserId) {
      chat.hasAccess = (await this.chatUserService.count(accountId, { chatId: chat.id, userId: accessUserId })) > 0;
    }

    return chat;
  }

  async findMany({
    accountId,
    filter,
    paging,
    accessUserId,
  }: {
    accountId: number;
    filter: FindFilter;
    paging?: PagingQuery;
    accessUserId?: number;
  }): Promise<Chat[]> {
    const chats = await this.createFindQb(accountId, null, filter).offset(paging?.skip).limit(paging?.take).getMany();
    if (accessUserId) {
      for (const chat of chats) {
        chat.hasAccess = (await this.chatUserService.count(accountId, { chatId: chat.id, userId: accessUserId })) > 0;
      }
    }
    return chats;
  }

  async findManyFull(
    accountId: number,
    user: User,
    filter: FindFilter,
    paging?: PagingQuery,
  ): Promise<FindChatsFullResultDto> {
    const qb = this.createFindQb(accountId, user.id, filter, true);

    const total = await qb.clone().getCount();
    const offset = Math.min(paging.take + paging.skip, total);

    const chats = await qb.offset(paging?.skip).limit(paging?.take).getMany();

    for (const chat of chats) {
      chat.users = await this.chatUserService.findMany(accountId, { chatId: chat.id });
      chat.hasAccess = chat.users.some((u) => u.userId === user.id);

      if (chat.lastMessage) {
        chat.lastMessage = await this.chatMessageService.getLastMessageInfo(accountId, chat.id, chat.lastMessage.id);
      }

      if (chat.entityId) {
        chat.entityInfo = await this.entityInfoService.findOne({ accountId, user, entityId: chat.entityId });
      }
    }

    return new FindChatsFullResultDto(
      chats.map((chat) => chat.toDto()),
      new PagingMeta(offset, total),
    );
  }

  async findManyFullPersonal(
    accountId: number,
    user: User,
    filter: ChatFindPersonalFilterDto,
    paging?: PagingQuery,
  ): Promise<FindChatsFullResultDto> {
    const qb = this.createFindQb(accountId, user.id, { ...filter, type: ChatType.PERSONAL }, true);

    qb.innerJoin('chat_user', 'cu', 'cu.chat_id = chat.id')
      .innerJoin('users', 'u', 'u.id = cu.user_id')
      .andWhere(`LOWER(u.first_name || ' ' || u.last_name) ilike :fullName`, {
        fullName: `%${filter.fullName.trim()}%`,
      })
      .andWhere('chat.created_by != u.id');

    const total = await qb.clone().getCount();
    const offset = Math.min(paging.take + paging.skip, total);

    const chats = await qb.offset(paging?.skip).limit(paging?.take).getMany();

    if (filter.fullName) {
      const personalChats: Chat[] = [];

      for (const chat of chats) {
        chat.users = await this.chatUserService.findMany(accountId, { chatId: chat.id });
        chat.hasAccess = chat.users.some((u) => u.userId === user.id);

        if (chat.lastMessage) {
          chat.lastMessage = await this.chatMessageService.getLastMessageInfo(accountId, chat.id, chat.lastMessage.id);
        }

        if (chat.entityId) {
          chat.entityInfo = await this.entityInfoService.findOne({ accountId, user, entityId: chat.entityId });
        }

        personalChats.push(chat);
      }

      return new FindChatsFullResultDto(
        personalChats.map((chat) => chat.toDto()),
        new PagingMeta(offset, total),
      );
    } else {
      return new FindChatsFullResultDto([], new PagingMeta(0, 0));
    }
  }

  async findManyFullByMessageContent(
    accountId: number,
    user: User,
    filter: ChatFindByMessageContentFilterDto,
    paging?: PagingQuery,
  ): Promise<FindChatsFullResultDto> {
    const qb = this.createFindByMessageContentQb(accountId, user.id, filter.messageContent, filter.providerId);

    const total = await qb.getCount();
    const offset = Math.min(paging.take + paging.skip, total);

    const chats = await qb.offset(paging?.skip).limit(paging?.take).getMany();

    for (const chat of chats) {
      chat.users = await this.chatUserService.findMany(accountId, { chatId: chat.id });
      chat.hasAccess = chat.users.some((u) => u.userId === user.id);

      if (chat.entityId) {
        chat.entityInfo = await this.entityInfoService.findOne({ accountId, user, entityId: chat.entityId });
      }
    }

    return new FindChatsFullResultDto(
      chats.map((chat) => chat.toDto()),
      new PagingMeta(offset, total),
    );
  }

  async count(accountId: number, filter: FindFilter): Promise<number> {
    return this.createFindQb(accountId, null, filter).getCount();
  }

  async getChatFull(accountId: number, user: User | null, chatId: number, hasUser = true): Promise<Chat> {
    const qb = this.createFindQb(accountId, hasUser ? (user?.id ?? null) : null, { chatId }, true);
    const chat = await qb
      .leftJoin(ChatPinnedMessage, 'cpm', 'cpm.chat_id = chat.id')
      .leftJoinAndMapMany('chat.pinnedMessages', ChatMessage, 'pinned_msg', 'pinned_msg.id = cpm.message_id')
      .getOne();

    if (!chat) {
      throw NotFoundError.withId(Chat, chatId);
    }

    chat.users = await this.chatUserService.findMany(accountId, { chatId });
    chat.hasAccess = user && hasUser ? chat.users.some((u) => u.userId === user.id) : null;

    if (chat.lastMessage) {
      chat.lastMessage = await this.chatMessageService.getLastMessageInfo(accountId, chat.id, chat.lastMessage.id);
    }

    if (user && chat.entityId) {
      chat.entityInfo = await this.entityInfoService.findOne({ accountId, user, entityId: chat.entityId });
    }

    return chat;
  }

  async getChatsByCursor(
    accountId: number,
    user: User,
    providerId: number | null | undefined,
    paging: CursorPagingQuery,
  ): Promise<Chat[]> {
    const providers = await this.chatProviderService.findMany(accountId, user.id, {
      providerId: providerId ?? undefined,
    });
    if (providers.length === 0) {
      return [];
    }
    const cursorChat = paging.cursor ? await this.findOne({ accountId, filter: { chatId: paging.cursor } }) : null;

    const lastMessageCreatedAt = cursorChat
      ? await this.chatMessageService.getLastMessageCreatedAt(accountId, cursorChat.id)
      : null;

    const from = lastMessageCreatedAt ?? cursorChat?.createdAt;

    const qb = this.createFindQb(accountId, user.id, { providerId: providers.map((p) => p.id) }, true);
    if (from) {
      qb.andWhere('COALESCE(last_msg.created_at, chat.created_at) < :from', { from });
    }

    const chats = await qb.orderBy('chat_updated_at', 'DESC').addOrderBy('chat.id', 'DESC').take(paging.take).getMany();

    for (const chat of chats) {
      chat.users = await this.chatUserService.findMany(accountId, { chatId: chat.id });
      if (chat.lastMessage) {
        chat.lastMessage = await this.chatMessageService.getLastMessageInfo(accountId, chat.id, chat.lastMessage.id);
      }
      if (user && chat.entityId) {
        chat.entityInfo = await this.entityInfoService.findOne({ accountId, user, entityId: chat.entityId });
      }
      chat.hasAccess = chat.users.some((u) => u.userId === user.id);
    }

    return chats;
  }

  async getUnseenForUser(accountId: number, userId: number, providerId?: number): Promise<number> {
    const cacheKey = ({
      accountId,
      userId,
      providerId,
      status,
    }: {
      accountId: number;
      userId: number;
      providerId?: number;
      status?: ChatMessageStatus;
    }) => `ChatMessage.count:${accountId}:${userId}${providerId ? `:${providerId}` : ''}${status ? `:${status}` : ''}`;
    const messagesQb = this.repository
      .createQueryBuilder('chat')
      .select('count(msg.id)', 'messagesCount')
      .leftJoin(ChatUser, 'user', 'user.chat_id = chat.id')
      .leftJoin(ChatMessage, 'msg', 'msg.chat_id = chat.id')
      .where('chat.account_id = :accountId', { accountId })
      .andWhere('user.user_id = :userId', { userId });
    if (providerId) {
      messagesQb.andWhere('chat.provider_id = :providerId', { providerId });
    }
    const { messagesCount } = await messagesQb.cache(cacheKey({ accountId, userId, providerId }), 15000).getRawOne();

    const seenQb = this.repository
      .createQueryBuilder('chat')
      .select('count(msg.id)', 'seenCount')
      .leftJoin(ChatMessage, 'msg', 'msg.chat_id = chat.id')
      .leftJoin(ChatMessageUserStatus, 'cmus', 'cmus.message_id = msg.id')
      .leftJoin(ChatUser, 'user', 'user.id = cmus.chat_user_id and user.chat_id = chat.id')
      .where('chat.account_id = :accountId', { accountId })
      .andWhere('user.user_id = :userId', { userId })
      .andWhere('cmus.status = :status', { status: ChatMessageStatus.SEEN });
    if (providerId) {
      seenQb.andWhere('chat.provider_id = :providerId', { providerId });
    }
    const { seenCount } = await seenQb
      .cache(cacheKey({ accountId, userId, providerId, status: ChatMessageStatus.SEEN }), 15000)
      .getRawOne();

    return messagesCount - seenCount;
  }

  async getLastMessageId(accountId: number, chatId: number): Promise<number> {
    return this.chatMessageService.getLastMessageId(accountId, chatId);
  }

  async createLinkedEntities({
    accountId,
    user,
    chatId,
    dto,
  }: {
    accountId: number;
    user: User;
    chatId: number;
    dto: CreateContactLeadDto;
  }) {
    if (!dto.leadTypeId && !dto.contactTypeId) {
      throw new BadRequestError('No contact or lead type provided');
    }

    const chatUser = await this.chatUserService.findOne(accountId, { chatId, role: ChatUserRole.EXTERNAL });
    if (!chatUser?.externalUser) {
      throw new BadRequestError(`No external user in chat ${chatId}`);
    }

    const fieldValues = [];
    if (chatUser.externalUser.phone) {
      fieldValues.push({ fieldType: FieldType.Phone, value: chatUser.externalUser.phone });
    }
    if (chatUser.externalUser.email) {
      fieldValues.push({ fieldType: FieldType.Email, value: chatUser.externalUser.email });
    }
    if (chatUser.externalUser.link) {
      fieldValues.push({ fieldType: FieldType.Link, value: chatUser.externalUser.link });
    }
    const lead = dto.leadTypeId
      ? {
          ownerId: dto.ownerId,
          entityTypeId: dto.leadTypeId,
          boardId: dto.leadBoardId,
          stageId: dto.leadStageId,
          name: dto.leadName ?? (!dto.contactTypeId ? chatUser.externalUser.fullName() : undefined),
          fieldValues,
        }
      : null;
    const contact = dto.contactTypeId
      ? {
          ownerId: dto.ownerId,
          entityTypeId: dto.contactTypeId,
          name: chatUser.externalUser.fullName(),
          fieldValues,
          linkedEntities: lead ? [lead] : undefined,
        }
      : null;

    if (contact || lead) {
      const [entity] = await this.entityService.createSimple({
        accountId,
        user,
        dto: contact ?? lead,
        options: { checkActiveLead: dto.checkActiveLead, checkDuplicate: dto.checkDuplicate },
      });
      this.updateGroupChat(accountId, user, chatId, { entityId: entity.id });

      return this.entityInfoService.getEntityInfo({ user, entity, access: true });
    }

    return null;
  }

  //TODO: move to ChatNotificationService
  async notifyChatUsers(accountId: number, chat: Chat, event: MultichatEventType, userId?: number): Promise<void> {
    if (!chat.users) {
      chat.users = await this.chatUserService.findMany(accountId, { chatId: chat.id });
    }
    const usersToNotify = userId
      ? chat.users.filter((chatUser) => chatUser.userId && chatUser.userId !== userId)
      : chat.users.filter((chatUser) => chatUser.userId);
    usersToNotify.forEach(async (chatUser) => {
      this.eventEmitter.emit(
        event,
        new ChatEvent({ accountId, userId: chatUser.userId, providerId: chat.providerId, chatId: chat.id }),
      );
    });
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
    settings: ActionChatSendAmworkSettings;
  }): Promise<Chat> {
    const entity = await this.entityInfoService.findOne({ accountId, entityId });
    if (entity && (!entity.stageId || settings.allowAnyStage || entity.stageId === entityStageId)) {
      let chat = await this.findOne({ accountId, filter: { entityId, transport: ChatProviderTransport.Amwork } });
      const ownerUser = await this.userService.findOne({ accountId, id: settings.userId ?? entity.ownerId });
      const participantIds = settings.sendTo ?? [
        (await this.userService.findOne({ accountId, id: entity.ownerId })).id,
      ];
      if (chat) {
        await this.chatUserService.addUsers({ accountId, chatId: chat.id, userIds: [ownerUser.id, ...participantIds] });
      } else {
        const provider = await this.chatProviderService.findOne(accountId, ownerUser.id, {
          transport: ChatProviderTransport.Amwork,
        });
        chat = await this.createGroupChat(accountId, ownerUser, {
          providerId: provider.id,
          title: entity.name,
          participantIds,
          entityId: entity.id,
        });
      }

      if (chat) {
        const account = await this.accountService.findOne({ accountId });
        const data = await this.documentGenerationService.getDataForGeneration({ accountId, entityId: entity.id });
        data['contact_name'] = entity.name;
        const text = Handlebars.compile(settings.message)(data);

        await this.chatMessageService.create(account, ownerUser, chat.id, { text });
      }

      return chat;
    }

    return null;
  }

  private createFindQb(
    accountId: number,
    userId: number | null,
    filter: FindFilter,
    full = false,
  ): SelectQueryBuilder<Chat> {
    const qb = full
      ? this.createFullQb(accountId, userId)
      : this.repository.createQueryBuilder('chat').where('chat.account_id = :accountId', { accountId });

    if (filter.chatId) {
      qb.andWhere('chat.id = :chatId', { chatId: filter.chatId });
    }

    if (filter.type) {
      qb.andWhere('chat.type = :type', { type: filter.type });
    }

    if (filter.entityId) {
      qb.andWhere('chat.entity_id = :entityId', { entityId: filter.entityId });
    }

    if (filter.title) {
      qb.andWhere('chat.title ilike :title', { title: `%${filter.title.trim()}%` });
    }

    if (filter.phoneNumber) {
      qb.innerJoin('chat_user', 'cu', 'cu.chat_id = chat.id')
        .innerJoin('chat_user_external', 'cue', 'cue.chat_user_id = cu.id')
        .andWhere(`cue.phone ilike :phone`, { phone: `%${filter.phoneNumber.replace(/^\+/, '')}%` });
    }

    if (filter.externalId) {
      qb.andWhere('chat.external_id = :externalId', { externalId: filter.externalId });
    }

    if (filter.providerId) {
      if (Array.isArray(filter.providerId)) {
        qb.andWhere('chat.provider_id IN (:...providerIds)', { providerIds: filter.providerId });
      } else {
        qb.andWhere('chat.provider_id = :providerId', { providerId: filter.providerId });
      }
    }

    if (filter.transport) {
      qb.innerJoin('chat_provider', 'cp', 'cp.id = chat.provider_id').andWhere('cp.transport = :transport', {
        transport: filter.transport,
      });
    }

    return qb;
  }

  private createFindByMessageContentQb(
    accountId: number,
    userId: number,
    messageContent: string,
    providerId?: number,
  ): SelectQueryBuilder<Chat> {
    const qb = this.createFindQb(accountId, userId, { providerId }, true);

    // Remove existing join with alias 'last_msg' if it exists
    qb.expressionMap.joinAttributes = qb.expressionMap.joinAttributes.filter((join) => join.alias.name !== 'last_msg');

    // First message with text matching the content will be used as the lastMessage
    qb.leftJoinAndMapOne(
      'chat.lastMessage',
      ChatMessage,
      'last_msg',
      `last_msg.chat_id = chat.id AND last_msg.text ilike :messageContent`,
      { messageContent: `%${messageContent.trim()}%` },
    ).andWhere('last_msg.id is not null');

    return qb;
  }

  private createFullQb(accountId: number, userId: number | null) {
    const qb = this.repository
      .createQueryBuilder('chat')
      .leftJoin(ChatUser, 'user', 'user.chat_id = chat.id')
      .where('chat.account_id = :accountId', { accountId })
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(status.*)', 'seen_count')
          .from(ChatMessageUserStatus, 'status')
          .where('status.chat_id = chat.id')
          .andWhere('status.chat_user_id = user.id')
          .andWhere('status.status = :status', { status: ChatMessageStatus.SEEN });
      }, 'chat_seen_by_user_count')
      .addSelect((subQuery) => {
        return subQuery.select('COUNT(msg.*)', 'message_count').from(ChatMessage, 'msg').where('msg.chat_id = chat.id');
      }, 'chat_total_message_count')
      .leftJoinAndMapOne(
        'chat.lastMessage',
        ChatMessage,
        'last_msg',
        `last_msg.chat_id = chat.id AND last_msg.id = (${LAST_MESSAGE})`,
      )
      .addSelect('COALESCE(last_msg.created_at, chat.created_at)', 'chat_updated_at');

    if (userId) {
      qb.andWhere('user.user_id = :userId', { userId });
    }

    return qb;
  }
}
