import { Column, Entity as OrmEntity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { Authorizable, AuthorizableObject } from '@/modules/iam/common';

import { PermissionObjectType } from '../../common';

import { UpdateEntityDto } from '../../Service/Entity/Dto/UpdateEntityDto';
import { EntityDto } from '../../Service/Entity/Dto/EntityDto';

@OrmEntity()
export class Entity implements Authorizable {
  @Column()
  accountId: number;

  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  name: string;

  @Column()
  entityTypeId: number;

  @Column()
  responsibleUserId: number;

  @Column()
  boardId: number | null;

  @Column()
  stageId: number | null;

  @Column()
  createdBy: number;

  @Column({ type: 'jsonb' })
  participantIds: number[] | null;

  @Column({ type: 'double precision' })
  weight: number;

  @Column({ default: false })
  focused: boolean;

  @Column({ nullable: true })
  copiedFrom: number | null;

  @Column({ nullable: true })
  copiedCount: number | null;

  @Column({ nullable: true })
  closedAt: Date | null;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column({
    type: 'numeric',
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: unknown) => Number(value),
    },
  })
  value: number;

  constructor(
    accountId: number,
    name: string,
    entityTypeId: number,
    responsibleUserId: number,
    boardId: number | null,
    stageId: number | null,
    createdBy: number,
    weight: number,
    focused: boolean,
    closedAt: Date | null,
    updatedAt: Date | null,
    createdAt: Date | null,
    participantIds: number[] | null,
    copiedFrom: number | null,
    copiedCount: number | null,
    value = 0,
  ) {
    this.accountId = accountId;
    this.name = name;
    this.entityTypeId = entityTypeId;
    this.responsibleUserId = responsibleUserId;
    this.boardId = boardId;
    this.stageId = stageId;
    this.createdBy = createdBy;
    this.weight = weight;
    this.focused = focused;
    this.closedAt = closedAt;
    this.participantIds = participantIds;
    this.copiedFrom = copiedFrom;
    this.copiedCount = copiedCount;
    this.createdAt = createdAt ?? DateUtil.now();
    this.updatedAt = updatedAt ?? createdAt ?? DateUtil.now();
    this.value = value;
  }

  toSimpleDto(): EntityDto {
    return new EntityDto(
      this.id,
      this.name,
      this.entityTypeId,
      this.responsibleUserId,
      this.boardId,
      this.stageId,
      this.createdBy,
      this.weight,
      this.focused,
      [],
      [],
      [],
      null,
      this.createdAt.toISOString(),
      this.updatedAt?.toISOString() ?? null,
      this.closedAt?.toISOString() ?? null,
      this.copiedFrom,
      this.copiedCount,
      null,
      null,
    );
  }

  copy(): Entity {
    this.copiedCount = (this.copiedCount ?? 0) + 1;

    return new Entity(
      this.accountId,
      this.name,
      this.entityTypeId,
      this.responsibleUserId,
      this.boardId,
      this.stageId,
      this.createdBy,
      this.weight,
      this.focused,
      this.closedAt,
      this.updatedAt,
      this.createdAt,
      this.participantIds,
      this.id,
      this.copiedCount,
    );
  }

  update(dto: UpdateEntityDto): Entity {
    this.name = dto.name !== undefined ? dto.name : this.name;
    this.responsibleUserId = dto.responsibleUserId !== undefined ? dto.responsibleUserId : this.responsibleUserId;
    this.boardId = dto.boardId !== undefined ? dto.boardId : this.boardId;
    this.stageId = dto.stageId !== undefined ? dto.stageId : this.stageId;
    this.closedAt = dto.closedAt !== undefined ? dto.closedAt : this.closedAt;
    this.focused = dto.focused !== undefined ? dto.focused : this.focused;

    this.updatedAt = DateUtil.now();

    return this;
  }

  getAuthorizableObject(): AuthorizableObject {
    return {
      type: PermissionObjectType.EntityType,
      id: this.entityTypeId,
      ownerId: this.responsibleUserId,
      createdBy: this.createdBy,
      participantIds: this.participantIds,
    };
  }
}
