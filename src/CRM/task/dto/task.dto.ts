import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { UserRights } from '@/modules/iam/common/types/user-rights';
import { EntityInfoDto } from '@/modules/entity/entity-info';

import { BaseTaskDto } from '../../base-task';
import { TaskSubtaskDto } from '../../task-subtask/dto/task-subtask.dto';
import { FileLinkDto } from '../../Service/FileLink/FileLinkDto';

import { Task } from '../entities';

export class TaskDto extends BaseTaskDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  plannedTime: number | null;

  @ApiProperty()
  @IsNumber()
  boardId: number;

  @ApiProperty()
  @IsNumber()
  stageId: number;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  settingsId: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'External ID' })
  @IsOptional()
  @IsString()
  externalId?: string | null;

  @ApiProperty({ type: [TaskSubtaskDto] })
  subtasks: TaskSubtaskDto[];

  constructor(
    task: Task,
    entityInfo: EntityInfoDto | null,
    fileLinks: FileLinkDto[],
    subtasks: TaskSubtaskDto[],
    userRights: UserRights,
  ) {
    super(task, entityInfo, fileLinks, userRights);

    this.title = task.title;
    this.plannedTime = task.plannedTime;
    this.boardId = task.boardId;
    this.stageId = task.stageId;
    this.settingsId = task.settingsId;
    this.externalId = task.externalId;
    this.subtasks = subtasks;
  }
}
