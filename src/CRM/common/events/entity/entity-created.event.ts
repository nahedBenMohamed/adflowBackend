import { UserNotification } from '@/common/enums';

import { EntityEvent } from './entity.event';

export class EntityCreatedEvent extends EntityEvent {
  entityName: string;
  createdBy: number;
  copiedFrom?: number | null;

  constructor({
    accountId,
    entityId,
    entityName,
    boardId,
    stageId,
    createdBy,
    ownerId,
    entityTypeId,
    userNotification = UserNotification.Default,
    copiedFrom = undefined,
  }: EntityCreatedEvent) {
    super({ accountId, entityId, entityTypeId, boardId, stageId, ownerId, userNotification });

    this.entityName = entityName;
    this.stageId = stageId;
    this.createdBy = createdBy;
    this.copiedFrom = copiedFrom;
  }
}
