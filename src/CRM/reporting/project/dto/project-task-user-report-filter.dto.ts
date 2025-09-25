import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

import { DatePeriodFilter } from '@/common';

export class ProjectTaskUserReportFilterDto {
  @ApiProperty({ description: 'Board ID' })
  @IsNumber()
  boardId: number;

  @ApiPropertyOptional({ description: 'Entity ID' })
  @IsNumber()
  entityId: number;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Task user IDs' })
  @IsOptional()
  @IsArray()
  taskUserIds?: number[] | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Task board stage IDs' })
  @IsOptional()
  @IsArray()
  taskBoardStageIds?: number[] | null;

  @ApiPropertyOptional({ type: DatePeriodFilter, nullable: true, description: 'Period' })
  @IsOptional()
  period?: DatePeriodFilter | null;
}
