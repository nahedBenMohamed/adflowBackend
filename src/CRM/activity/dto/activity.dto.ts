import { ApiProperty } from '@nestjs/swagger';

import { UserRights } from '@/modules/iam/common/types/user-rights';
import { EntityInfoDto } from '@/modules/entity/entity-info';

import { FileLinkDto } from '../../Service/FileLink/FileLinkDto';

import { BaseTaskDto } from '../../base-task';
import { Activity } from '../entities';

export class ActivityDto extends BaseTaskDto {
  @ApiProperty()
  activityTypeId: number;

  @ApiProperty({ required: false })
  result?: string;

  constructor(activity: Activity, entityInfo: EntityInfoDto | null, fileLinks: FileLinkDto[], userRights: UserRights) {
    super(activity, entityInfo, fileLinks, userRights);
    this.activityTypeId = activity.activityTypeId;
    this.result = activity.result;
  }
}
