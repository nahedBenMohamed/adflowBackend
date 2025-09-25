import { ChatMessageEvent } from './chat-message.event';

export class ChatMessageCreatedEvent extends ChatMessageEvent {
  fromUser: string;
  text: string;
  createdAt: string;
  entityId: number | null;

  constructor({
    accountId,
    userId,
    providerId,
    chatId,
    fromUser,
    messageId,
    text,
    createdAt,
    entityId,
  }: ChatMessageCreatedEvent) {
    super({ accountId, userId, providerId, chatId, messageId });

    this.fromUser = fromUser;
    this.text = text;
    this.createdAt = createdAt;
    this.entityId = entityId;
  }
}
