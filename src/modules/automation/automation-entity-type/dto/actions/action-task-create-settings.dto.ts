import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { ActionsSettings } from '../../../common';
import { DeadlineType } from '../../enums';

export class ActionTaskCreateSettings extends ActionsSettings {
  @ApiPropertyOptional({ description: 'User ID responsible for the task', nullable: true })
  @IsOptional()
  @IsNumber()
  responsibleUserId?: number | null;

  @ApiProperty({ description: 'Title of the task' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Text of the task' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'Deadline type', enum: DeadlineType })
  @IsEnum(DeadlineType)
  deadlineType: DeadlineType;

  @ApiPropertyOptional({ description: 'Deadline time in seconds', nullable: true })
  @IsOptional()
  @IsNumber()
  deadlineTime?: number | null;

  @ApiPropertyOptional({ description: 'Defer start time in seconds', nullable: true })
  @IsOptional()
  @IsNumber()
  deferStart?: number | null;
}
