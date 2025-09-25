import { UserNotification } from '@/common/enums';

export class EntityEvent {
  accountId: number;
  entityId: number;
  entityTypeId: number;
  boardId: number | null;
  stageId: number | null;
  ownerId: number;
  userNotification: UserNotification;

  constructor({
    accountId,
    entityId,
    entityTypeId,
    boardId,
    stageId,
    ownerId,
    userNotification = UserNotification.Default,
  }: EntityEvent) {
    this.accountId = accountId;
    this.entityId = entityId;
    this.entityTypeId = entityTypeId;
    this.boardId = boardId;
    this.stageId = stageId;
    this.ownerId = ownerId;
    this.userNotification = userNotification;
  }
}
