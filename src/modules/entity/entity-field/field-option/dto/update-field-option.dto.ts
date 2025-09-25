import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { ObjectState } from '@/common';

import { FieldOptionDto } from './field-option.dto';

export class UpdateFieldOptionDto extends PartialType(
  PickType(FieldOptionDto, ['label', 'color', 'sortOrder'] as const),
) {
  @ApiProperty({ description: 'Field option ID' })
  @IsNumber()
  id: number;

  @ApiPropertyOptional({ enum: ObjectState, description: 'Object state' })
  @IsOptional()
  @IsEnum(ObjectState)
  state?: ObjectState;
}
