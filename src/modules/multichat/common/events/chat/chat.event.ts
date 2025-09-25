export class ChatEvent {
  accountId: number;
  userId: number;
  providerId: number;
  chatId: number;

  constructor({ accountId, userId, providerId, chatId }: ChatEvent) {
    this.accountId = accountId;
    this.userId = userId;
    this.providerId = providerId;
    this.chatId = chatId;
  }
}
