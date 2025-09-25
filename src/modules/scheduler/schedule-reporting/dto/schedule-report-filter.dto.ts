import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { DatePeriodFilter } from '@/common';
import { ScheduleReportType } from '../enums';

export class ScheduleReportFilterDto {
  @ApiProperty({ enum: ScheduleReportType, description: 'Report type' })
  @IsEnum(ScheduleReportType)
  type: ScheduleReportType;

  @ApiProperty({ description: 'Schedule ID' })
  @IsNumber()
  scheduleId: number;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Board IDs filter' })
  @IsOptional()
  @IsNumber({}, { each: true })
  boardIds?: number[] | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'User IDs filter' })
  @IsOptional()
  @IsNumber({}, { each: true })
  userIds?: number[] | null;

  @ApiPropertyOptional({ type: DatePeriodFilter, nullable: true, description: 'Period filter' })
  @IsOptional()
  period?: DatePeriodFilter | null;
}
