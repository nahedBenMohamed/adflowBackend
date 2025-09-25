import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';

import { DatePeriodFilter } from '@/common';

import { BoardStageType } from '../../../board-stage';
import { GeneralReportType } from '../enums';
import { GeneralReportFilterVisibilityDto } from './general-report-filter-visibility.dto';

export class GeneralReportFilterDto {
  @ApiProperty({ enum: GeneralReportType, description: 'Report type' })
  @IsEnum(GeneralReportType)
  type: GeneralReportType;

  @ApiPropertyOptional({ description: 'Field ID for owner instead of responsibleUserId' })
  @IsOptional()
  ownerFieldId?: number;

  @ApiPropertyOptional({ description: 'Entity type ID' })
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

  @ApiPropertyOptional({ type: GeneralReportFilterVisibilityDto, nullable: true, description: 'Visibility' })
  @IsOptional()
  visibility?: GeneralReportFilterVisibilityDto | null;
}
