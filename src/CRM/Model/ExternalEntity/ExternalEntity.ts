import { Column, Entity, PrimaryColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { UIDataRecord } from './UIDataRecord';

@Entity()
export class ExternalEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  entityId: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  system: number | null;

  @Column({ type: 'jsonb', nullable: true })
  rawData: object | null;

  @Column({ type: 'jsonb', nullable: true })
  uiData: UIDataRecord[] | null;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(
    accountId: number,
    entityId: number,
    url: string,
    system: number | null = null,
    rawData: object | null = null,
    uiData: UIDataRecord[] | null = null,
  ) {
    this.accountId = accountId;
    this.entityId = entityId;
    this.url = url;
    this.system = system;
    this.rawData = rawData;
    this.uiData = uiData;
    this.createdAt = DateUtil.now();
  }
}
