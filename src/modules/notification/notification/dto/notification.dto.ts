import { ApiProperty } from '@nestjs/swagger';

import { EntityInfoDto } from '@/modules/entity/entity-info/dto/entity-info.dto';

import { NotificationType } from '../enums';

export class NotificationDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  type: NotificationType;

  @ApiProperty()
  objectId: number;

  @ApiProperty()
  entityInfo: EntityInfoDto | null;

  @ApiProperty()
  fromUser: number | null;

  @ApiProperty()
  title: string | null;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  isSeen: boolean;

  @ApiProperty()
  startsIn: number | null;

  @ApiProperty()
  createdAt: string;

  constructor(
    id: number,
    userId: number,
    type: NotificationType,
    objectId: number,
    entityInfo: EntityInfoDto | null,
    fromUser: number | null,
    title: string | null,
    description: string,
    isSeen: boolean,
    startsIn: number | null,
    createdAt: string,
  ) {
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.objectId = objectId;
    this.entityInfo = entityInfo;
    this.fromUser = fromUser;
    this.title = title;
    this.description = description;
    this.isSeen = isSeen;
    this.startsIn = startsIn;
    this.createdAt = createdAt;
  }
}
