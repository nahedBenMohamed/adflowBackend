import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';

import { EntityEventType } from '../enums/entity-event-type.enum';

export class EntityEventItemDto {
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

  constructor(objectId: number, type: EntityEventType, data: object, createdAt: string) {
    this.id = objectId;
    this.type = type;
    this.data = data;
    this.createdAt = createdAt;
  }
}
