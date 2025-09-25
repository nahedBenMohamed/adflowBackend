export class ActivityEvent {
  accountId: number;
  entityId: number;
  activityId: number;

  constructor({ accountId, entityId, activityId }: ActivityEvent) {
    this.accountId = accountId;
    this.entityId = entityId;
    this.activityId = activityId;
  }
}
