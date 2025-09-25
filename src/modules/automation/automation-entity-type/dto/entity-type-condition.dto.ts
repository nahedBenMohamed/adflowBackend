import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { AutomationFieldCondition } from '../../common';

export class EntityTypeCondition {
  @ApiPropertyOptional({ description: 'List of owner user ids', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  ownerIds?: number[];

  @ApiPropertyOptional({ description: 'List of field conditions', type: [AutomationFieldCondition] })
  @IsOptional()
  @IsArray()
  @Type(() => AutomationFieldCondition)
  fields?: AutomationFieldCondition[];
}
