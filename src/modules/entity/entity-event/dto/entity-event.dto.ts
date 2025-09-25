import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';

import { EntityEventType } from '../enums/entity-event-type.enum';

export class EntityEventDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  entityId: number;

  @ApiProperty()
  @IsNumber()
  objectId: number;

  @ApiProperty()
  @IsEnum(EntityEventType)
  type: EntityEventType;

  @ApiProperty()
  createdAt: string;

  constructor(id: number, entityId: number, objectId: number, type: EntityEventType, createdAt: string) {
    this.id = id;
    this.entityId = entityId;
    this.objectId = objectId;
    this.type = type;
    this.createdAt = createdAt;
  }
}
