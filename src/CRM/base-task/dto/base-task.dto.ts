import { ApiProperty } from '@nestjs/swagger';

import { UserRights } from '@/modules/iam/common/types/user-rights';
import { EntityInfoDto } from '@/modules/entity/entity-info';

import { FileLinkDto } from '../../Service/FileLink/FileLinkDto';

import { TaskView } from '../enums';
import { BaseTask } from '../entities';

export abstract class BaseTaskDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  responsibleUserId: number;

  @ApiProperty({ nullable: true })
  startDate: string | null;

  @ApiProperty({ nullable: true })
  endDate: string | null;

  @ApiProperty()
  text: string;

  @ApiProperty()
  isResolved: boolean;

  @ApiProperty({ nullable: true })
  resolvedDate: string | null;

  @ApiProperty()
  createdBy: number;

  @ApiProperty()
  weight: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  view: TaskView;

  @ApiProperty({ type: [FileLinkDto] })
  fileLinks: FileLinkDto[];

  @ApiProperty({ nullable: true })
  entityInfo: EntityInfoDto | null;

  @ApiProperty({ type: () => UserRights })
  userRights: UserRights;

  constructor(baseTask: BaseTask, entityInfo: EntityInfoDto | null, fileLinks: FileLinkDto[], userRights: UserRights) {
    this.id = baseTask.id;
    this.responsibleUserId = baseTask.responsibleUserId;
    this.startDate = baseTask.startDate ? baseTask.startDate.toISOString() : null;
    this.endDate = baseTask.endDate ? baseTask.endDate.toISOString() : null;
    this.text = baseTask.text;
    this.isResolved = baseTask.isResolved;
    this.createdBy = baseTask.createdBy;
    this.weight = baseTask.weight;
    this.createdAt = baseTask.createdAt.toISOString();
    this.view = baseTask.view();
    this.fileLinks = fileLinks;
    this.resolvedDate = baseTask.resolvedDate ? baseTask.resolvedDate.toISOString() : null;
    this.entityInfo = entityInfo;
    this.userRights = userRights;
  }
}
