import { ChatEvent } from '../chat/chat.event';

export class ChatMessageEvent extends ChatEvent {
  messageId: number;

  constructor({ accountId, userId, providerId, chatId, messageId }: ChatMessageEvent) {
    super({ accountId, userId, providerId, chatId });

    this.messageId = messageId;
  }
}
