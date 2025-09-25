import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

@Entity()
export class DocumentTemplate {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  name: string;

  @Column()
  createdBy: number;

  @Column()
  createdCount: number;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(accountId: number, name: string, createdBy: number, createdAt?: Date) {
    this.name = name;
    this.createdBy = createdBy;
    this.accountId = accountId;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public update(name: string): void {
    this.name = name;
  }

  public incrementCreatedCount(): void {
    this.createdCount++;
  }
}
