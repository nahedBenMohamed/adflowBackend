import { PickType } from '@nestjs/swagger';

import { type EntityEventType } from '../enums/entity-event-type.enum';
import { EntityEventDto } from './entity-event.dto';

export class UpdateEntityEventDto extends PickType(EntityEventDto, [
  'entityId',
  'objectId',
  'type',
  'createdAt',
] as const) {
  oldEntityId: number | null;

  constructor(
    entityId: number,
    objectId: number,
    type: EntityEventType,
    createdAt: string,
    oldEntityId: number | null,
  ) {
    super(entityId, objectId, type, createdAt);

    this.entityId = entityId;
    this.objectId = objectId;
    this.type = type;
    this.createdAt = createdAt;
    this.oldEntityId = oldEntityId;
  }
}
