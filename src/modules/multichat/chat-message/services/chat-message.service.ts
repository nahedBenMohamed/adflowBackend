import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { NotFoundError, PagingMeta, PagingQuery } from '@/common';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { User } from '@/modules/iam/user/entities/user.entity';

import { ChatMessageStatus, MultichatEventType } from '../../common';

import { ChatUser, ChatUserService } from '../../chat-user';

import { SendChatMessageDto, ChatMessagesFilterDto, ChatMessagesResultDto } from '../dto';
import { ChatMessage, ChatMessageUserStatus, ChatMessageFile, ChatMessageReaction } from '../entities';
import { ExpandableField } from '../types';
import { ChatMessageFileService } from './chat-message-file.service';
import { ChatMessageReactionService } from './chat-message-reaction.service';
import { ChatMessageUserStatusService } from './chat-message-user-status.service';
import { ChatNotificationService } from './chat-notification.service';

interface FindFilter {
  chatId: number;
}
interface FindOptions {
  expand?: ExpandableField[];
}

@Injectable()
export class ChatMessageService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly repository: Repository<ChatMessage>,
    @Inject(forwardRef(() => ChatUserService))
    private readonly chatUserService: ChatUserService,
    private readonly chatMessageUserStatusService: ChatMessageUserStatusService,
    private readonly chatMessageFileService: ChatMessageFileService,
    private readonly chatMessageReactionService: ChatMessageReactionService,
    private readonly chatNotificationService: ChatNotificationService,
  ) {}

  async create(
    account: Account,
    user: User,
    chatId: number,
    dto: SendChatMessageDto,
    notifyUsers = true,
  ): Promise<ChatMessage> {
    const chatUser = await this.chatUserService.getOne(account.id, { chatId, userId: user.id });

    const message = await this.repository.save(
      new ChatMessage(account.id, chatId, chatUser.id, null, dto.replyToId, dto.text),
    );

    if (dto.fileIds) {
      message.files = await this.chatMessageFileService.addMessageFiles(account, message.id, dto.fileIds);
    }

    if (dto.replyToId) {
      message.replyTo = await this.getMessageSimple(account.id, chatId, dto.replyToId);
    }

    message.statuses = [
      await this.chatMessageUserStatusService.setStatus(
        account.id,
        chatId,
        chatUser.id,
        message.id,
        ChatMessageStatus.SEEN,
      ),
    ];

    if (notifyUsers) {
      this.chatNotificationService.notifyUsers(
        account,
        chatId,
        chatUser,
        message,
        MultichatEventType.ChatMessageCreated,
        user.fullName,
      );
    }

    return message;
  }

  async createExternal(
    account: Account,
    chatUser: ChatUser,
    text: string,
    externalId: string | null,
    fileIds?: string[] | null,
    notifyUsers = true,
  ): Promise<ChatMessage> {
    const message = await this.repository.save(
      new ChatMessage(account.id, chatUser.chatId, chatUser.id, externalId, null, text),
    );

    if (fileIds) {
      message.files = await this.chatMessageFileService.addMessageFiles(account, message.id, fileIds);
    }

    message.statuses = [
      await this.chatMessageUserStatusService.setStatus(
        account.id,
        chatUser.chatId,
        chatUser.id,
        message.id,
        ChatMessageStatus.SEEN,
      ),
    ];

    if (notifyUsers) {
      this.chatNotificationService.notifyUsers(
        account,
        chatUser.chatId,
        chatUser,
        message,
        MultichatEventType.ChatMessageCreated,
        chatUser.externalUser?.fullName(),
      );
    }

    return message;
  }

  async getMessageDto(account: Account, userId: number, chatId: number, messageId: number): Promise<ChatMessage> {
    await this.chatUserService.getOne(account.id, { chatId, userId });

    return await this.getMessageFull(account, chatId, messageId);
  }

  async findOne(accountId: number, filter: FindFilter, options?: FindOptions): Promise<ChatMessage | null> {
    const message = await this.createFindQb(accountId, filter).getOne();
    return message && options?.expand ? await this.expandOne(message, options.expand) : message;
  }
  async findMany(accountId: number, filter: FindFilter, options?: FindOptions): Promise<ChatMessage[]> {
    const messages = await this.createFindQb(accountId, filter).orderBy('cm.created_at', 'DESC').getMany();
    return messages && options?.expand ? await this.expandMany(messages, options.expand) : messages;
  }

  private createFindQb(accountId: number, filter: FindFilter) {
    const qb = this.repository.createQueryBuilder('cm').where('cm.account_id = :accountId', { accountId });

    if (filter.chatId) {
      qb.andWhere('cm.chat_id = :chatId', { chatId: filter.chatId });
    }

    return qb;
  }

  private async expandOne(message: ChatMessage, expand: ExpandableField[]): Promise<ChatMessage> {
    if (expand.includes('chatUser')) {
      message.chatUser = await this.chatUserService.findOne(message.accountId, { id: message.chatUserId });
    }
    return message;
  }
  private async expandMany(messages: ChatMessage[], expand: ExpandableField[]): Promise<ChatMessage[]> {
    return await Promise.all(messages.map((message) => this.expandOne(message, expand)));
  }

  async update(
    account: Account,
    user: User,
    chatId: number,
    messageId: number,
    dto: SendChatMessageDto,
  ): Promise<ChatMessage> {
    const chatUser = await this.chatUserService.getOne(account.id, { chatId, userId: user.id });

    const message = await this.getMessageSimple(account.id, chatId, messageId, chatUser.id);

    await this.repository.save(message.update(dto.replyToId, dto.text));

    if (dto.fileIds) {
      message.files = await this.chatMessageFileService.updateMessageFiles(account, message.id, dto.fileIds);
    }

    if (dto.replyToId) {
      message.replyTo = await this.getMessageSimple(account.id, chatId, dto.replyToId);
    }

    this.chatNotificationService.notifyUsers(
      account,
      chatId,
      chatUser,
      message,
      MultichatEventType.ChatMessageUpdated,
      user.fullName,
    );

    return message;
  }

  async updateStatus(
    account: Account,
    user: User,
    chatId: number,
    messageId: number,
    status: ChatMessageStatus,
  ): Promise<ChatMessage> {
    const chatUser = await this.chatUserService.getOne(account.id, { chatId, userId: user.id });
    const message = await this.getMessageFull(account, chatId, messageId);

    const userStatus = await this.chatMessageUserStatusService.setStatus(
      account.id,
      chatId,
      chatUser.id,
      message.id,
      status,
    );
    message.statuses = [...message.statuses.filter((s) => userStatus.chatUserId !== s.chatUserId), userStatus];

    this.chatNotificationService.notifyUsers(
      account,
      chatId,
      chatUser,
      message,
      MultichatEventType.ChatMessageUpdated,
      user.fullName,
    );

    return message;
  }

  async updateStatusBatch(
    account: Account,
    user: User,
    chatId: number,
    messageIds: number[],
    status: ChatMessageStatus,
  ): Promise<ChatMessage[]> {
    const chatUser = await this.chatUserService.getOne(account.id, { chatId, userId: user.id });
    const messages = await this.getMessagesFull(account.id, chatId, messageIds);

    for (const message of messages) {
      const userStatus = await this.chatMessageUserStatusService.setStatus(
        account.id,
        chatId,
        chatUser.id,
        message.id,
        status,
      );
      message.statuses = [...message.statuses.filter((s) => userStatus.chatUserId !== s.chatUserId), userStatus];

      this.chatNotificationService.notifyUsers(
        account,
        chatId,
        chatUser,
        message,
        MultichatEventType.ChatMessageUpdated,
        user.fullName,
      );
    }

    return messages;
  }

  async updateStatusDirect({
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
    await this.chatMessageUserStatusService.updateStatusDirect({ accountId, userId: user.id, chatId, status });
  }

  async react(account: Account, user: User, chatId: number, messageId: number, reaction: string): Promise<ChatMessage> {
    const chatUser = await this.chatUserService.getOne(account.id, { chatId, userId: user.id });
    const message = await this.getMessageFull(account, chatId, messageId);

    const messageReaction = await this.chatMessageReactionService.add(account.id, chatUser, message.id, reaction);
    message.reactions = [...message.reactions, messageReaction];

    this.chatNotificationService.notifyUsers(
      account,
      chatId,
      chatUser,
      message,
      MultichatEventType.ChatMessageUpdated,
      user.fullName,
    );

    return message;
  }

  async unreact(
    account: Account,
    user: User,
    chatId: number,
    messageId: number,
    reactionId: number,
  ): Promise<ChatMessage> {
    const chatUser = await this.chatUserService.getOne(account.id, { chatId, userId: user.id });
    const message = await this.getMessageFull(account, chatId, messageId);

    await this.chatMessageReactionService.remove(account.id, chatUser, message.id, reactionId);
    message.reactions = message.reactions.filter((reaction) => reaction.id !== reactionId);

    this.chatNotificationService.notifyUsers(
      account,
      chatId,
      chatUser,
      message,
      MultichatEventType.ChatMessageUpdated,
      user.fullName,
    );

    return message;
  }

  async delete(account: Account, user: User, chatId: number, messageId: number): Promise<boolean> {
    const chatUser = await this.chatUserService.getOne(account.id, { chatId, userId: user.id });

    const message = await this.getMessageSimple(account.id, chatId, messageId, chatUser.id);

    await this.chatMessageFileService.deleteMessageFiles(account.id, message.id);

    await this.repository.delete(message.id);

    this.chatNotificationService.notifyUsers(
      account,
      chatId,
      chatUser,
      message,
      MultichatEventType.ChatMessageDeleted,
      user.fullName,
    );

    return true;
  }

  async getMessagesForUI(
    account: Account,
    userId: number,
    chatId: number,
    filter: ChatMessagesFilterDto,
    paging: PagingQuery,
  ): Promise<ChatMessagesResultDto> {
    await this.chatUserService.getOne(account.id, { chatId, userId });

    const qb = this.getChatMessagesFullQuery(account.id, chatId);
    const total = await qb.clone().getCount();

    const [messages, offset] = filter.focusedMessageId
      ? await this.getMessagesFullToMessage(account, chatId, filter.focusedMessageId, qb, paging)
      : await this.getMessagesFullWithPaging(qb, paging, total);

    this.setAllFileDownloadUrls(account, messages);

    return new ChatMessagesResultDto(
      messages.map((message) => message.toDto()),
      new PagingMeta(offset, total),
    );
  }

  async getMessageSimple(
    accountId: number,
    chatId: number,
    messageId: number,
    chatUserId?: number,
  ): Promise<ChatMessage> {
    const message = await this.repository.findOneBy({
      accountId,
      chatId,
      id: messageId,
      chatUserId,
    });

    if (!message) {
      throw new NotFoundError(`Message ${messageId} not found in chat ${chatId}`);
    }

    return message;
  }

  private async getMessagesFullWithPaging(
    qb: SelectQueryBuilder<ChatMessage>,
    paging: PagingQuery,
    total: number,
  ): Promise<[ChatMessage[], number]> {
    const messages = await qb
      .clone()
      .skip(paging.skip)
      .take(paging.take)
      //FIX: https://github.com/typeorm/typeorm/issues/8213
      .orderBy('msg.createdAt', 'DESC')
      .addOrderBy('msg.id', 'DESC')
      .getMany();

    const offset = Math.min(paging.take + paging.skip, total);
    return [messages, offset];
  }

  private async getMessagesFullToMessage(
    account: Account,
    chatId: number,
    focusedMessageId: number,
    qb: SelectQueryBuilder<ChatMessage>,
    paging: PagingQuery,
  ): Promise<[ChatMessage[], number]> {
    const message = await this.getMessageFull(account, chatId, focusedMessageId, false);
    const newerQb = qb.clone().andWhere('msg.created_at > :createdAt', { createdAt: message.createdAt });
    const newerCount = await newerQb.clone().getCount();
    const skip = Math.min(newerCount, paging.skip);
    const newerMessages = await newerQb
      .clone()
      .skip(skip)
      //FIX: https://github.com/typeorm/typeorm/issues/8213
      .orderBy('msg.createdAt', 'DESC')
      .addOrderBy('msg.id', 'DESC')
      .getMany();

    const olderMessages = await qb
      .clone()
      .andWhere('msg.created_at < :createdAt', { createdAt: message.createdAt })
      .take(paging.take)
      //FIX: https://github.com/typeorm/typeorm/issues/8213
      .orderBy('msg.createdAt', 'DESC')
      .addOrderBy('msg.id', 'DESC')
      .getMany();

    const messages = [...newerMessages, message, ...olderMessages];
    const offset = messages.length + skip;

    return [messages, offset];
  }

  private async getMessageFull(
    account: Account,
    chatId: number,
    messageId: number,
    setFileDownloadUrl = true,
  ): Promise<ChatMessage> {
    const message = await this.getChatMessagesFullQuery(account.id, chatId)
      .andWhere('msg.id = :messageId', { messageId })
      .getOne();

    if (!message) {
      throw new NotFoundError(`Message ${messageId} not found in chat ${chatId}`);
    }

    if (setFileDownloadUrl) {
      this.setFileDownloadUrls(account, message);
    }

    return message;
  }

  private async getMessagesFull(accountId: number, chatId: number, messageIds: number[]): Promise<ChatMessage[]> {
    if (messageIds.length === 0) {
      return [];
    }

    return await this.getChatMessagesFullQuery(accountId, chatId)
      .andWhere('msg.id IN (:...messageIds)', { messageIds })
      .getMany();
  }

  async getLastMessageId(accountId: number, chatId: number): Promise<number> {
    const data = await this.repository
      .createQueryBuilder('msg')
      .select('msg.id', 'id')
      .where('msg.account_id = :accountId', { accountId })
      .andWhere('msg.chat_id = :chatId', { chatId })
      .orderBy('msg.created_at', 'DESC')
      .getRawOne();

    return data.id;
  }

  async getLastMessageCreatedAt(accountId: number, chatId: number): Promise<Date | null> {
    const data = await this.repository
      .createQueryBuilder('msg')
      .select('msg.created_at', 'created_at')
      .where('msg.account_id = :accountId', { accountId })
      .andWhere('msg.chat_id = :chatId', { chatId })
      .orderBy('msg.created_at', 'DESC')
      .getRawOne();

    return data?.created_at ? new Date(data.created_at) : null;
  }

  async getLastMessageInfo(accountId: number, chatId: number, messageId: number): Promise<ChatMessage> {
    return await this.repository
      .createQueryBuilder('msg')
      .leftJoin(ChatUser, 'user', 'msg.chat_id = user.chat_id')
      .leftJoinAndMapMany('msg.statuses', ChatMessageUserStatus, 'status', 'msg.id = status.message_id')
      .leftJoinAndMapMany('msg.files', ChatMessageFile, 'file', 'msg.id = file.message_id')
      .where('msg.account_id = :accountId', { accountId })
      .andWhere('msg.chat_id = :chatId', { chatId })
      .andWhere('msg.id = :messageId', { messageId })
      .orderBy('msg.created_at', 'DESC')
      .addOrderBy('msg.id', 'DESC')
      .getOne();
  }

  private getChatMessagesFullQuery(accountId: number, chatId: number): SelectQueryBuilder<ChatMessage> {
    return this.repository
      .createQueryBuilder('msg')
      .leftJoinAndMapMany('msg.statuses', ChatMessageUserStatus, 'status', 'msg.id = status.message_id')
      .leftJoinAndMapMany('msg.files', ChatMessageFile, 'file', 'msg.id = file.message_id')
      .leftJoinAndMapOne('msg.replyTo', ChatMessage, 'replyTo', 'msg.reply_to_id = replyTo.id')
      .leftJoinAndMapMany('msg.reactions', ChatMessageReaction, 'reaction', 'msg.id = reaction.message_id')
      .where('msg.account_id = :accountId', { accountId })
      .andWhere('msg.chat_id = :chatId', { chatId });
  }

  private setAllFileDownloadUrls(account: Account, messages: ChatMessage[]): void {
    messages.forEach((message) => this.setFileDownloadUrls(account, message));
  }
  private setFileDownloadUrls(account: Account, message: ChatMessage): void {
    message.files.forEach((file) => {
      this.chatMessageFileService.setFileDownloadUrl(account, file);
    });
  }
}
