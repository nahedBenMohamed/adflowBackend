import { Column, Entity, PrimaryColumn } from 'typeorm';

import { DateUtil } from '@/common';
import { AccountApiAccessDto } from '../dto';

@Entity()
export class AccountApiAccess {
  @PrimaryColumn()
  accountId: number;

  @Column()
  apiKey: string;

  @Column()
  createdAt: Date;

  constructor(accountId: number, apiKey: string, createdAt?: Date | null) {
    this.accountId = accountId;
    this.apiKey = apiKey;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public toDto(): AccountApiAccessDto {
    return {
      apiKey: this.apiKey,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
