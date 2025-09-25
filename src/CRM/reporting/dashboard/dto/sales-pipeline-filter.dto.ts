import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';

import { DatePeriodFilter } from '@/common';

import { SalesPipelineType } from '../../common';

export class SalesPipelineFilterDto {
  @ApiProperty({ enum: SalesPipelineType, description: 'Sales pipeline type' })
  @IsEnum(SalesPipelineType)
  type: SalesPipelineType;

  @ApiProperty({ description: 'Board ID' })
  @IsNumber()
  boardId: number;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'User IDs' })
  @IsOptional()
  @IsArray()
  userIds?: number[] | null;

  @ApiPropertyOptional({ type: DatePeriodFilter, nullable: true, description: 'Period' })
  @IsOptional()
  period?: DatePeriodFilter | null;
}
