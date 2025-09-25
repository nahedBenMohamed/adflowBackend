import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

import { DatePeriodFilter } from '@/common';

import { TaskSorting } from './TaskSorting';

export class BaseTaskBoardFilter {
  @ApiPropertyOptional({ description: 'Sorting', enum: TaskSorting })
  @IsOptional()
  @IsEnum(TaskSorting)
  sorting?: TaskSorting | null;

  @ApiPropertyOptional({ description: 'Search text in task' })
  @IsOptional()
  @IsString()
  search?: string | null;

  @ApiPropertyOptional({ description: 'Show resolved tasks' })
  @IsOptional()
  @IsBoolean()
  showResolved?: boolean | null;

  @ApiPropertyOptional({ description: 'Created by User IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  createdBy?: number[] | null;

  @ApiPropertyOptional({ description: 'Owner (Responsible) by User IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  ownerIds?: number[] | null;

  @ApiPropertyOptional({ description: 'Entity ids', type: [Number] })
  @IsOptional()
  @IsArray()
  entityIds?: number[] | null;

  @ApiPropertyOptional({ description: 'Created at', type: DatePeriodFilter })
  @IsOptional()
  @IsObject()
  createdAt?: DatePeriodFilter;

  @ApiPropertyOptional({ description: 'Task start date', type: DatePeriodFilter })
  @IsOptional()
  @IsObject()
  startDate?: DatePeriodFilter;

  @ApiPropertyOptional({ description: 'Task end date', type: DatePeriodFilter })
  @IsOptional()
  @IsObject()
  endDate?: DatePeriodFilter;

  @ApiPropertyOptional({ description: 'Task resolved date', type: DatePeriodFilter })
  @IsOptional()
  @IsObject()
  resolvedDate?: DatePeriodFilter;
}
