import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';

import { DatePeriodFilter } from '@/common';
import { BoardStageType } from '@/CRM/board-stage';

import { InventoryReportType } from '../enums';

export class InventoryReportFilterDto {
  @ApiProperty({ enum: InventoryReportType })
  @IsEnum(InventoryReportType)
  type: InventoryReportType;

  @ApiProperty()
  @IsNumber()
  entityTypeId: number;

  @ApiProperty()
  @IsNumber()
  productsSectionId: number;

  @ApiPropertyOptional({ type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  boardIds?: number[] | null;

  @ApiPropertyOptional({ type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  userIds?: number[] | null;

  @ApiPropertyOptional({ type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  warehouseIds?: number[] | null;

  @ApiPropertyOptional({ type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  categoryIds?: number[] | null;

  @ApiPropertyOptional({ enum: BoardStageType, nullable: true })
  @IsOptional()
  @IsEnum(BoardStageType)
  stageType?: BoardStageType | null;

  @ApiPropertyOptional({ type: DatePeriodFilter, nullable: true })
  @IsOptional()
  period?: DatePeriodFilter | null;
}
