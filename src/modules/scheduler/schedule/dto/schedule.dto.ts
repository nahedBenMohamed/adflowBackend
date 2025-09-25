import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { SchedulePerformerDto } from '../../schedule-performer';
import { ScheduleType } from '../enums';
import { ScheduleTimeIntervalDto } from './schedule-time-interval.dto';

export class ScheduleDto {
  @ApiProperty({ description: 'Schedule ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Schedule name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Schedule icon name' })
  @IsString()
  icon: string;

  @ApiProperty({ enum: ScheduleType, description: 'Schedule type' })
  @IsEnum(ScheduleType)
  type: ScheduleType;

  @ApiProperty({ description: 'Time slot size in seconds for Board schedule' })
  @IsNumber()
  timePeriod: number;

  @ApiPropertyOptional({ nullable: true, description: 'Appointments limit for one time slot for Board schedule' })
  @IsOptional()
  @IsNumber()
  appointmentLimit?: number | null;

  @ApiPropertyOptional({ description: 'Time buffer before appointment in seconds' })
  @IsOptional()
  @IsNumber()
  timeBufferBefore?: number | null;

  @ApiPropertyOptional({ description: 'Time buffer after appointment in seconds' })
  @IsOptional()
  @IsNumber()
  timeBufferAfter?: number | null;

  @ApiPropertyOptional({ description: 'Allow only one entity per day' })
  @IsOptional()
  @IsBoolean()
  oneEntityPerDay?: boolean;

  @ApiPropertyOptional({ nullable: true, description: 'Linked EntityType ID' })
  @IsOptional()
  @IsNumber()
  entityTypeId?: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Linked ProductsSection ID' })
  @IsOptional()
  @IsNumber()
  productsSectionId?: number | null;

  @ApiProperty({ description: 'Date and time when the schedule was created in ISO format' })
  @IsString()
  createdAt: string;

  @ApiProperty({ type: [SchedulePerformerDto], description: 'Schedule performers' })
  @IsArray()
  performers: SchedulePerformerDto[];

  @ApiPropertyOptional({ type: [ScheduleTimeIntervalDto], description: 'Schedule time intervals' })
  @IsOptional()
  intervals?: ScheduleTimeIntervalDto[] | null;
}
