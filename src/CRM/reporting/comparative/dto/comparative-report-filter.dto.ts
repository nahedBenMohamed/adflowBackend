import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';

import { GroupByDate, DatePeriodFilter } from '@/common';

import { BoardStageType } from '../../../board-stage';

export class ComparativeReportFilterDto {
  @ApiProperty({ enum: GroupByDate, description: 'Type of grouping by date' })
  @IsEnum(GroupByDate)
  type: GroupByDate;

  @ApiPropertyOptional({ description: 'Field ID for owner instead of responsibleUserId' })
  @IsOptional()
  ownerFieldId?: number;

  @ApiPropertyOptional({ type: Number, description: 'Entity type ID' })
  @IsNumber()
  entityTypeId: number;

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
}
