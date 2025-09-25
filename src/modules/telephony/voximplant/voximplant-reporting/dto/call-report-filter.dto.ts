import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';

import { DatePeriodFilter, NumberFilter } from '@/common';
import { BoardStageType } from '@/CRM/board-stage';

import { TelephonyReportType } from '../enums';

export class CallReportFilterDto {
  @ApiProperty({ enum: TelephonyReportType, description: 'Report type' })
  @IsEnum(TelephonyReportType)
  type: TelephonyReportType;

  @ApiPropertyOptional({ type: Number, nullable: true, description: 'Entity type ID' })
  @IsOptional()
  @IsNumber()
  entityTypeId?: number | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Board IDs' })
  @IsOptional()
  @IsArray()
  boardIds?: number[] | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'User IDs' })
  @IsOptional()
  @IsArray()
  userIds?: number[] | null;

  @ApiPropertyOptional({ enum: BoardStageType, nullable: true, description: 'Stage type' })
  @IsOptional()
  @IsEnum(BoardStageType)
  stageType?: BoardStageType | null;

  @ApiPropertyOptional({ type: DatePeriodFilter, nullable: true, description: 'Period' })
  @IsOptional()
  period?: DatePeriodFilter | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Number IDs' })
  @IsOptional()
  @IsArray()
  numberIds?: number[] | null;

  @ApiPropertyOptional({ type: NumberFilter, nullable: true, description: 'Duration' })
  @IsOptional()
  duration?: NumberFilter | null;
}
