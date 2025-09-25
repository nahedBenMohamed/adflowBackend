import { Column, Entity, PrimaryColumn } from 'typeorm';

import { ObjectState } from '@/common';

import { EntityLinkDto } from '../dto';

@Entity()
export class EntityLink {
  @PrimaryColumn()
  sourceId: number;

  @PrimaryColumn()
  targetId: number;

  @Column()
  sortOrder: number;

  @Column()
  accountId: number;

  constructor(accountId: number, sourceId: number, targetId: number, sortOrder: number) {
    this.accountId = accountId;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.sortOrder = sortOrder;
  }

  public toDto(): EntityLinkDto {
    return {
      sourceId: this.sourceId,
      targetId: this.targetId,
      sortOrder: this.sortOrder,
      state: ObjectState.Unchanged,
    };
  }
}
