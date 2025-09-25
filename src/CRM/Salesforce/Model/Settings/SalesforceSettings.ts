import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

@Entity('salesforce_settings')
export class SalesforceSettings {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  domain: string;

  @Column()
  key: string;

  @Column()
  secret: string;

  @Column({ nullable: true })
  refreshToken: string | null;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(accountId: number, domain: string, key: string, secret: string) {
    this.accountId = accountId;
    this.domain = domain;
    this.key = key;
    this.secret = secret;
    this.createdAt = DateUtil.now();
  }
}
