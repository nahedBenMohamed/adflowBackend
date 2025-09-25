import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateBaseTaskDto } from '../../base-task';
import { CreateTaskSubtaskDto } from '../../task-subtask/dto';

export class CreateTaskDto extends CreateBaseTaskDto {
  @ApiPropertyOptional({ nullable: true, description: 'Entity ID' })
  @IsOptional()
  @IsNumber()
  entityId?: number | null;

  @ApiProperty({ description: 'Title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ nullable: true, description: 'Planned time' })
  @IsOptional()
  @IsNumber()
  plannedTime?: number | null;

  @ApiPropertyOptional({ description: 'Board ID' })
  @IsOptional()
  @IsNumber()
  boardId?: number;

  @ApiPropertyOptional({ description: 'Stage ID' })
  @IsOptional()
  @IsNumber()
  stageId?: number;

  @ApiProperty({ nullable: true, description: 'Settings ID' })
  @IsOptional()
  @IsNumber()
  settingsId?: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'External ID' })
  @IsOptional()
  @IsString()
  externalId?: string | null;

  @ApiPropertyOptional({ nullable: true, type: [String], description: 'File IDs' })
  @IsOptional()
  @IsString({ each: true })
  fileIds?: string[] | null;

  @ApiPropertyOptional({ type: [CreateTaskSubtaskDto], description: 'Subtasks' })
  @IsOptional()
  @IsArray()
  @Type(() => CreateTaskSubtaskDto)
  subtasks?: CreateTaskSubtaskDto[];
}
