import { QuantityAmount } from '@/common';

import { ScheduleReportRowDto } from '../dto';

export class ScheduleReportRow {
  ownerId: number;
  ownerName: string | null;
  sold: QuantityAmount;
  all: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  canceled: number;

  constructor(
    ownerId: number,
    ownerName: string | null,
    sold: QuantityAmount,
    all: number,
    scheduled: number,
    confirmed: number,
    completed: number,
    canceled: number,
  ) {
    this.ownerId = ownerId;
    this.ownerName = ownerName;
    this.sold = sold;
    this.all = all;
    this.scheduled = scheduled;
    this.confirmed = confirmed;
    this.completed = completed;
    this.canceled = canceled;
  }

  public static empty(ownerId: number): ScheduleReportRow {
    return new ScheduleReportRow(ownerId, null, QuantityAmount.empty(), 0, 0, 0, 0, 0);
  }

  public toDto(): ScheduleReportRowDto {
    return {
      ownerId: this.ownerId,
      ownerName: this.ownerName,
      sold: this.sold.toDto(),
      all: this.all,
      scheduled: this.scheduled,
      confirmed: this.confirmed,
      completed: this.completed,
      canceled: this.canceled,
    };
  }

  public add(row: ScheduleReportRow): ScheduleReportRow {
    this.sold.add(row.sold);
    this.all += row.all;
    this.scheduled += row.scheduled;
    this.confirmed += row.confirmed;
    this.completed += row.completed;
    this.canceled += row.canceled;

    return this;
  }
}
