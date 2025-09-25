import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

import { CreateFieldOptionDto } from '../../field-option';
import { FieldDto } from './field.dto';

export class CreateFieldDto extends PickType(FieldDto, [
  'name',
  'type',
  'code',
  'active',
  'sortOrder',
  'entityTypeId',
  'fieldGroupId',
  'value',
  'format',
] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ type: [CreateFieldOptionDto] })
  @IsOptional()
  @IsArray()
  options?: CreateFieldOptionDto[];
}
