export class UserDeletedEvent {
  accountId: number;
  userId: number;
  newUserId?: number | null;

  constructor({ accountId, userId, newUserId }: UserDeletedEvent) {
    this.accountId = accountId;
    this.userId = userId;
    this.newUserId = newUserId;
  }
}
