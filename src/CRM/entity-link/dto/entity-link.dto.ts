import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';

import { ObjectState } from '@/common';

export class EntityLinkDto {
  @ApiProperty()
  @IsNumber()
  sourceId: number;

  @ApiProperty()
  @IsNumber()
  targetId: number;

  @ApiProperty()
  @IsNumber()
  sortOrder: number;

  @ApiProperty({ enum: ObjectState })
  @IsEnum(ObjectState)
  state: ObjectState;
}
