export class UserCreatedEvent {
  accountId: number;
  userId: number;

  constructor({ accountId, userId }: UserCreatedEvent) {
    this.accountId = accountId;
    this.userId = userId;
  }
}
