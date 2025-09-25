export class EntityTypeEvent {
  accountId: number;
  userId: number;
  entityTypeId: number;

  constructor({ accountId, userId, entityTypeId }: EntityTypeEvent) {
    this.accountId = accountId;
    this.userId = userId;
    this.entityTypeId = entityTypeId;
  }
}
