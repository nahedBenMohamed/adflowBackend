import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { FieldType } from '@/modules/entity/entity-field/common';

export class EntitySearchFilterDto {
  @ApiPropertyOptional({ description: 'Filter by entity type ID.', nullable: true, type: [Number] })
  @IsOptional()
  entityTypeId?: number | number[] | null;

  @ApiPropertyOptional({ description: 'Filter by entity board ID.', nullable: true, type: [Number] })
  @IsOptional()
  boardId?: number | number[] | null;

  @ApiPropertyOptional({ description: 'Filter by entity name.', nullable: true })
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiPropertyOptional({ description: 'Exclude entity id from search', nullable: true, type: [Number] })
  @IsOptional()
  excludeEntityId?: number | number[] | null;

  @ApiPropertyOptional({ description: 'Filter by field value.', nullable: true })
  @IsOptional()
  @IsString()
  fieldValue?: string | null;

  @ApiPropertyOptional({ enum: FieldType, description: 'Filter by field type for field value.', nullable: true })
  @IsOptional()
  @IsString()
  fieldType?: FieldType | null;

  @ApiPropertyOptional({ description: 'Search in linked entities', nullable: true })
  @IsOptional()
  @IsBoolean()
  searchInLinked?: boolean | null;
}
