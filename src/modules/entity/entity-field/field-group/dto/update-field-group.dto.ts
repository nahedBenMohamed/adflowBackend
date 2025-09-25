import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { ObjectState } from '@/common';

import { FieldGroupDto } from './field-group.dto';

export class UpdateFieldGroupDto extends PickType(FieldGroupDto, ['id', 'name', 'sortOrder', 'code'] as const) {
  @ApiProperty({ enum: ObjectState, description: 'Object state' })
  @IsEnum(ObjectState)
  state?: ObjectState;
}
