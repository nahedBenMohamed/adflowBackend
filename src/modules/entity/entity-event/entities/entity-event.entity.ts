import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { EntityEventType } from '../enums/entity-event-type.enum';
import { CreateEntityEventDto } from '../dto/create-entity-event.dto';
import { EntityEventDto } from '../dto/entity-event.dto';

@Entity()
export class EntityEvent {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  entityId: number;

  @Column()
  objectId: number;

  @Column()
  type: EntityEventType;

  @Column()
  createdAt: Date;

  constructor(accountId: number, entityId: number, objectId: number, type: EntityEventType, createdAt: Date) {
    this.accountId = accountId;
    this.entityId = entityId;
    this.objectId = objectId;
    this.type = type;
    this.createdAt = createdAt;
  }

  public static fromDto(accountId: number, dto: CreateEntityEventDto): EntityEvent {
    return new EntityEvent(
      accountId,
      dto.entityId,
      dto.objectId,
      dto.type,
      dto.createdAt ? DateUtil.fromISOString(dto.createdAt) : DateUtil.now(),
    );
  }

  public toDto(): EntityEventDto {
    return new EntityEventDto(this.id, this.entityId, this.objectId, this.type, this.createdAt.toISOString());
  }
}
