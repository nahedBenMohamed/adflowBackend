import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { TaskView } from '../enums';

@Entity()
export abstract class BaseTask {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  responsibleUserId: number;

  @Column({ nullable: true })
  startDate: Date | null;

  @Column({ nullable: true })
  endDate: Date | null;

  @Column()
  text: string;

  @Column()
  createdBy: number;

  @Column()
  isResolved: boolean;

  @Column({ nullable: true })
  resolvedDate: Date | null;

  @Column({ type: 'double precision' })
  weight: number;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(
    accountId: number,
    createdBy: number,
    responsibleUserId: number,
    text: string,
    isResolved: boolean,
    startDate: Date | null,
    endDate: Date | null,
    resolvedDate: Date | null,
    weight: number,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.createdBy = createdBy;
    this.responsibleUserId = responsibleUserId;
    this.text = text;
    this.isResolved = isResolved;
    this.startDate = startDate;
    this.endDate = endDate;
    this.resolvedDate = resolvedDate;
    this.weight = weight;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public isTaskExpired(): boolean {
    if (this.endDate) {
      return DateUtil.isPast(this.endDate);
    }

    return false;
  }

  public isTaskToday(): boolean {
    const now = DateUtil.now();

    if (this.startDate && this.endDate) {
      return this.startDate <= now && this.endDate >= now;
    } else if (this.startDate) {
      return DateUtil.isToday(this.startDate);
    } else if (this.endDate) {
      return DateUtil.isToday(this.endDate);
    }

    return false;
  }

  public abstract view(): TaskView;
}
