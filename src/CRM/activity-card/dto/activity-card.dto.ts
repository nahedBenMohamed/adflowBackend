import { ApiProperty } from '@nestjs/swagger';

import { UserRights } from '@/modules/iam/common/types/user-rights';
import { EntityInfoDto } from '@/modules/entity/entity-info';

import { BaseTaskDto } from '../../base-task';
import { Activity } from '../../activity';
import { FileLinkDto } from '../../Service/FileLink/FileLinkDto';

export class ActivityCardDto extends BaseTaskDto {
  @ApiProperty()
  activityTypeId: number;

  constructor(activity: Activity, entityInfo: EntityInfoDto | null, fileLinks: FileLinkDto[], userRights: UserRights) {
    super(activity, entityInfo, fileLinks, userRights);

    this.activityTypeId = activity.activityTypeId;
  }
}
