import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

import { DatePeriodFilter } from '@/common';

export class DashboardFilterDto {
  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'User IDs' })
  @IsOptional()
  @IsArray()
  userIds?: number[] | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Board IDs' })
  @IsOptional()
  @IsArray()
  boardIds?: number[] | null;

  @ApiPropertyOptional({ type: DatePeriodFilter, nullable: true, description: 'Period' })
  @IsOptional()
  period?: DatePeriodFilter | null;
}
