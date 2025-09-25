import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { ActivityTypeDto } from '../dto/activity-type.dto';

@Entity('activity_type')
export class ActivityType {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  name: string;

  @Column()
  accountId: number;

  @Column()
  isActive: boolean;

  @Column()
  createdAt: Date;

  constructor(accountId: number, name: string, isActive?: boolean, createdAt?: Date) {
    this.accountId = accountId;
    this.name = name;
    this.isActive = isActive ?? true;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public toDto(): ActivityTypeDto {
    return {
      id: this.id,
      name: this.name,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
