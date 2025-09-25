import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { UserRights } from '@/modules/iam/common/types/user-rights';
import { EntityInfoDto } from '@/modules/entity/entity-info';

import { BaseTaskDto } from '../../base-task';
import { Task } from '../../task';
import { FileLinkDto } from '../../Service/FileLink/FileLinkDto';

export class TaskBoardCardDto extends BaseTaskDto {
  @ApiProperty({ description: 'Title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Planned time', nullable: true })
  @IsOptional()
  @IsNumber()
  plannedTime: number | null;

  @ApiProperty({ description: 'Stage ID', nullable: true })
  @IsOptional()
  @IsNumber()
  stageId: number | null;

  @ApiProperty({ description: 'Settings ID', nullable: true })
  @IsOptional()
  @IsNumber()
  settingsId: number | null;

  @ApiProperty({ description: 'Subtask count', nullable: true })
  @IsOptional()
  @IsNumber()
  subtaskCount: number | null;

  constructor(
    task: Task,
    entityInfo: EntityInfoDto | null,
    fileLinks: FileLinkDto[],
    userRights: UserRights,
    subtaskCount: number | null,
  ) {
    super(task, entityInfo, fileLinks, userRights);

    this.title = task.title;
    this.plannedTime = task.plannedTime;
    this.stageId = task.stageId;
    this.settingsId = task.settingsId;
    this.subtaskCount = subtaskCount;
  }
}
