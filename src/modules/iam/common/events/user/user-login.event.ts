export class UserLoginEvent {
  accountId: number;
  userId: number;
  subscriptionName: string;
  gaClientId: string | null;
  gaUserId: string | null;

  constructor({ accountId, userId, subscriptionName, gaClientId, gaUserId }: UserLoginEvent) {
    this.accountId = accountId;
    this.userId = userId;
    this.subscriptionName = subscriptionName;
    this.gaClientId = gaClientId;
    this.gaUserId = gaUserId;
  }
}
