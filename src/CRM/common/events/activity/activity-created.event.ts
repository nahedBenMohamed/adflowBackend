import { ActivityEvent } from './activity.event';

export class ActivityCreatedEvent extends ActivityEvent {
  ownerId: number;
  createdBy: number;
  activityText: string;
  activityTypeName: string;
  createdAt: string;

  constructor({
    accountId,
    activityId,
    ownerId,
    entityId,
    createdBy,
    activityText,
    activityTypeName,
    createdAt,
  }: ActivityCreatedEvent) {
    super({ accountId, entityId, activityId });

    this.ownerId = ownerId;
    this.createdBy = createdBy;
    this.activityText = activityText;
    this.activityTypeName = activityTypeName;
    this.createdAt = createdAt;
  }
}
