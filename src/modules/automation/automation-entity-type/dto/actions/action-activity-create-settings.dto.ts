import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { ActionsSettings } from '../../../common';
import { DeadlineType } from '../../enums';

export class ActionActivityCreateSettings extends ActionsSettings {
  @ApiPropertyOptional({ description: 'User ID responsible for the activity', nullable: true })
  @IsOptional()
  @IsNumber()
  responsibleUserId?: number | null;

  @ApiProperty({ description: 'ActivityType ID' })
  @IsNumber()
  activityTypeId: number;

  @ApiProperty({ description: 'Text of the activity' })
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
