import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Account } from '@/modules/iam/account/entities/account.entity';

import {
  ChatMessageCreatedEvent,
  ChatMessageEvent,
  ChatMessageUpdatedEvent,
  ChatUserRole,
  MultichatEventType,
} from '../../common';
import { ChatUserService, ChatUser } from '../../chat-user';
import { ChatProviderService } from '../../chat-provider/services/chat-provider.service';
import { ChatProviderProxyService } from '../../providers/chat-provider-proxy.service';
import { Chat } from '../../chat/entities/chat.entity';
import { ChatService } from '../../chat/services/chat.service';

import { ChatMessage } from '../entities/chat-message.entity';

@Injectable()
export class ChatNotificationService {
  constructor(
    private eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    @Inject(forwardRef(() => ChatUserService))
    private readonly chatUserService: ChatUserService,
    @Inject(forwardRef(() => ChatProviderService))
    private readonly chatProviderService: ChatProviderService,
    private readonly providerProxyService: ChatProviderProxyService,
  ) {}

  public async notifyUsers(
    account: Account,
    chatId: number,
    sendBy: ChatUser,
    message: ChatMessage,
    type: MultichatEventType,
    fromUserName: string,
  ): Promise<void> {
    const chat = await this.chatService.findOne({ accountId: account.id, filter: { chatId } });
    const chatUsers = await this.chatUserService.findMany(account.id, { chatId });

    const internalUsers = chatUsers.filter((chatUser) => chatUser.userId && chatUser.id !== sendBy.id);
    if (internalUsers.length > 0) {
      this.notifyInternalUsers(account.id, chat, message, type, internalUsers, fromUserName);
    }

    const externalUsers = chatUsers.filter(
      (chatUser) => chatUser.role === ChatUserRole.EXTERNAL && chatUser.id !== sendBy.id,
    );
    if (externalUsers.length > 0) {
      const provider = await this.chatProviderService.findOne(account.id, null, { providerId: chat.providerId });
      if (provider) {
        this.providerProxyService.notifyChatUsers(account, provider, chat, type, message, externalUsers);
      }
    }
  }

  private async notifyInternalUsers(
    accountId: number,
    chat: Chat,
    message: ChatMessage,
    type: MultichatEventType,
    chatUsers: ChatUser[],
    fromUserName: string,
  ): Promise<void> {
    const lastMessageId = await this.chatService.getLastMessageId(accountId, chat.id);
    chatUsers.forEach(async (chatUser) => {
      const event = this.createMessageEvent(accountId, chat, message, chatUser, type, fromUserName, lastMessageId);
      this.eventEmitter.emit(type, event);
    });
  }

  private createMessageEvent(
    accountId: number,
    chat: Chat,
    message: ChatMessage,
    chatUser: ChatUser,
    type: MultichatEventType,
    fromUserName: string,
    lastMessageId?: number | null,
  ): ChatMessageEvent {
    switch (type) {
      case MultichatEventType.ChatMessageCreated:
        return this.createMessageCreatedEvent(accountId, chat, message, chatUser, fromUserName);
      case MultichatEventType.ChatMessageUpdated:
        return this.createMessageChangedEvent(accountId, chat, message, chatUser, lastMessageId);
      case MultichatEventType.ChatMessageDeleted:
        return this.createMessageChangedEvent(accountId, chat, message, chatUser, lastMessageId);
      default:
        throw new Error(`Unknown event type: ${type}`);
    }
  }
  private createMessageCreatedEvent(
    accountId: number,
    chat: Chat,
    message: ChatMessage,
    chatUser: ChatUser,
    fromUserName: string,
  ) {
    const text = message.text || message.files?.[0]?.name;
    return new ChatMessageCreatedEvent({
      accountId,
      userId: chatUser.userId,
      providerId: chat.providerId,
      chatId: chat.id,
      fromUser: fromUserName,
      messageId: message.id,
      text,
      createdAt: message.createdAt.toISOString(),
      entityId: chat.entityId,
    });
  }

  private createMessageChangedEvent(
    accountId: number,
    chat: Chat,
    message: ChatMessage,
    chatUser: ChatUser,
    lastMessageId: number | null,
  ) {
    return new ChatMessageUpdatedEvent({
      accountId,
      userId: chatUser.userId,
      providerId: chat.providerId,
      chatId: chat.id,
      messageId: message.id,
      isLastMessage: message.id === lastMessageId,
    });
  }
}
