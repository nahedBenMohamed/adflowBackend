export class NotificationUnseenEvent {
  accountId: number;
  userId: number;
  unseenCount: number;

  constructor({ accountId, userId, unseenCount }: NotificationUnseenEvent) {
    this.accountId = accountId;
    this.userId = userId;
    this.unseenCount = unseenCount;
  }
}
