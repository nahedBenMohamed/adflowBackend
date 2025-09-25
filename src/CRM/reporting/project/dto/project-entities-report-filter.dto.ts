import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

import { DatePeriodFilter } from '@/common';

export class ProjectEntitiesReportFilterDto {
  @ApiProperty({ description: 'Entity type ID' })
  @IsNumber()
  entityTypeId: number;

  @ApiProperty({ description: 'Board ID' })
  @IsNumber()
  boardId: number;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Project user IDs' })
  @IsOptional()
  @IsArray()
  ownerIds?: number[] | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Project stage IDs' })
  @IsOptional()
  @IsArray()
  taskBoardStageIds?: number[] | null;

  @ApiPropertyOptional({ type: DatePeriodFilter, nullable: true, description: 'Period' })
  @IsOptional()
  period?: DatePeriodFilter | null;
}
