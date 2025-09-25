import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { TaskFieldCode, TaskSettingsType } from '../enums';

export class TaskSettingsDto {
  @ApiProperty({ description: 'Task settings id' })
  @IsNumber()
  id: number;

  @ApiProperty({ enum: TaskSettingsType, description: 'Task settings connected object type' })
  @IsEnum(TaskSettingsType)
  type: TaskSettingsType;

  @ApiProperty({ nullable: true, description: 'Connected object id' })
  @IsOptional()
  @IsNumber()
  recordId: number | null;

  @ApiProperty({ enum: TaskFieldCode, isArray: true, description: 'Task settings active fields' })
  @IsEnum(TaskFieldCode, { each: true })
  activeFields: TaskFieldCode[];
}
