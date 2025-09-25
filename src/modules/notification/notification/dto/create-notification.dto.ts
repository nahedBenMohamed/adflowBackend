import { NotificationType } from '../enums';

export class CreateNotificationDto {
  accountId: number;

  userId: number;

  type: NotificationType;

  objectId: number;

  entityId: number | null;

  fromUser: number | null;

  title: string | null;

  description: string | null;

  startsIn: number | null;

  constructor(
    accountId: number,
    userId: number,
    type: NotificationType,
    objectId: number,
    entityId: number | null,
    fromUser: number | null,
    title: string | null,
    description: string | null,
    startsIn: number | null = null,
  ) {
    this.accountId = accountId;
    this.userId = userId;
    this.type = type;
    this.objectId = objectId;
    this.entityId = entityId;
    this.fromUser = fromUser;
    this.title = title;
    this.description = description;
    this.startsIn = startsIn;
  }

  setStartsIn(startsIn: number | null) {
    this.startsIn = startsIn;
  }
}
