import { ApiProperty } from '@nestjs/swagger';

import { NotificationType } from '../../notification/enums';

export class NotificationTypeSettingsDto {
  @ApiProperty()
  type: NotificationType;

  @ApiProperty()
  isEnabled: boolean;

  @ApiProperty({ nullable: true })
  objectId: number | null;

  @ApiProperty({ nullable: true })
  before: number | null;

  @ApiProperty({ nullable: true })
  followUserIds: number[] | null;

  constructor(
    type: NotificationType,
    isEnabled: boolean,
    objectId: number | null,
    before: number | null,
    followUserIds: number[] | null,
  ) {
    this.type = type;
    this.isEnabled = isEnabled;
    this.objectId = objectId;
    this.before = before;
    this.followUserIds = followUserIds;
  }
}
