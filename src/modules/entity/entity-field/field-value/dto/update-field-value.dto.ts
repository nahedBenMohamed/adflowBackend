import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { ObjectState } from '@/common';

import { FieldValueDto } from './field-value.dto';

export class UpdateFieldValueDto extends PickType(FieldValueDto, ['fieldId', 'fieldType', 'payload'] as const) {
  @ApiProperty({ enum: ObjectState })
  @IsEnum(ObjectState)
  state?: ObjectState;
}
