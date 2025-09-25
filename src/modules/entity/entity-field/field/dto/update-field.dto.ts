import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';

import { ObjectState } from '@/common';

import { UpdateFieldOptionDto } from '../../field-option';
import { FieldDto } from './field.dto';

export class UpdateFieldDto extends PartialType(
  PickType(FieldDto, ['name', 'type', 'code', 'active', 'sortOrder', 'fieldGroupId', 'value', 'format'] as const),
) {
  @ApiProperty({ description: 'Field ID' })
  @IsNumber()
  id: number;

  @ApiPropertyOptional({ type: [UpdateFieldOptionDto], description: 'Field options' })
  @IsOptional()
  @IsArray()
  options?: UpdateFieldOptionDto[] = [];

  @ApiPropertyOptional({ enum: ObjectState, description: 'Object state' })
  @IsOptional()
  @IsEnum(ObjectState)
  state?: ObjectState;
}
