import { UserNotification } from '@/common/enums';
import { EntityEvent } from './entity.event';

export class EntityOwnerChangedEvent extends EntityEvent {
  entityName: string;
  changedBy: number;

  constructor({
    accountId,
    entityId,
    entityName,
    boardId,
    stageId,
    changedBy,
    ownerId,
    entityTypeId,
    userNotification = UserNotification.Default,
  }: EntityOwnerChangedEvent) {
    super({ accountId, entityId, entityTypeId, boardId, stageId, ownerId, userNotification });

    this.entityName = entityName;
    this.changedBy = changedBy;
    this.ownerId = ownerId;
  }
}
