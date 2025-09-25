import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

import { DatePeriodFilter } from '@/common';

import { EntitySorting } from './EntitySorting';
import { EntityFieldFilter } from './EntityFieldFilter';
import { EntityTaskFilter } from './entity-task-filter.enum';

export class EntityBoardCardFilter {
  @ApiPropertyOptional({ enum: EntitySorting, nullable: true, description: 'Sorting' })
  @IsOptional()
  @IsEnum(EntitySorting)
  sorting?: EntitySorting | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Include stage IDs' })
  @IsOptional()
  @IsArray()
  includeStageIds?: number[] | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Exclude stage IDs' })
  @IsOptional()
  @IsArray()
  excludeStageIds?: number[] | null;

  @ApiPropertyOptional({ nullable: true, description: 'Search text in entity name' })
  @IsOptional()
  @IsString()
  search?: string | null;

  @ApiPropertyOptional({ type: DatePeriodFilter, nullable: true, description: 'Created at' })
  @IsOptional()
  @IsObject()
  createdAt?: DatePeriodFilter | null;

  @ApiPropertyOptional({ type: DatePeriodFilter, nullable: true, description: 'Closed at' })
  @IsOptional()
  @IsObject()
  closedAt?: DatePeriodFilter | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Owner IDs' })
  @IsOptional()
  @IsArray()
  ownerIds?: number[] | null;

  @ApiPropertyOptional({ enum: EntityTaskFilter, nullable: true, description: 'Tasks filter' })
  @IsOptional()
  @IsEnum(EntityTaskFilter)
  tasks?: EntityTaskFilter | null;

  @ApiPropertyOptional({ type: [EntityFieldFilter], nullable: true, description: 'Fields filters' })
  @IsOptional()
  @IsArray()
  @Type(() => EntityFieldFilter)
  fields?: EntityFieldFilter[] | null;
}
