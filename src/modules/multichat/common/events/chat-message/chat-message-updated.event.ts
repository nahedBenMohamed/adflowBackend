import { ChatMessageEvent } from './chat-message.event';

export class ChatMessageUpdatedEvent extends ChatMessageEvent {
  isLastMessage: boolean;

  constructor({ accountId, userId, providerId, chatId, messageId, isLastMessage }: ChatMessageUpdatedEvent) {
    super({ accountId, userId, providerId, chatId, messageId });

    this.isLastMessage = isLastMessage;
  }
}
