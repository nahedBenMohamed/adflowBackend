import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { DatePeriodFilter } from '@/common';

import { CustomerReportType } from '../enums';

export class CustomerReportFilterDto {
  @ApiProperty({ description: 'Entity type ID' })
  @IsNumber()
  entityTypeId: number;

  @ApiPropertyOptional({ enum: CustomerReportType, nullable: true, description: 'Report type' })
  @IsOptional()
  @IsEnum(CustomerReportType)
  type?: CustomerReportType | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Board IDs' })
  @IsOptional()
  @IsNumber({}, { each: true })
  boardIds?: number[] | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Owner IDs' })
  @IsOptional()
  @IsNumber({}, { each: true })
  ownerIds?: number[] | null;

  @ApiPropertyOptional({ type: DatePeriodFilter, nullable: true, description: 'Period' })
  @IsOptional()
  period?: DatePeriodFilter | null;
}
