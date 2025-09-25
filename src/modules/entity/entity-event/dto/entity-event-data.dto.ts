import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';

import { EntityEventType } from '../enums/entity-event-type.enum';

export class EntityEventDataDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsEnum(EntityEventType)
  type: EntityEventType;

  @ApiProperty()
  data: any;

  @ApiProperty()
  createdAt: string;

  constructor(id: number, type: EntityEventType, data: any, createdAt: string) {
    this.id = id;
    this.type = type;
    this.data = data;
    this.createdAt = createdAt;
  }
}
