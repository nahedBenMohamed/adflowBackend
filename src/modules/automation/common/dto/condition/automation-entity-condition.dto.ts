import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

import { AutomationFieldCondition } from './automation-field-condition.dto';

export class AutomationEntityCondition {
  @ApiPropertyOptional({ description: 'Stage ID', nullable: true })
  @IsOptional()
  @IsNumber()
  stageId?: number | null;

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
