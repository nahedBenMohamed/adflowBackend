import { ServiceEvent } from '@/common';

export class SchedulePerformerEvent extends ServiceEvent {
  accountId: number;
  scheduleId: number;
  performerId: number;

  constructor(data: Omit<SchedulePerformerEvent, 'key' | 'checkHistory'> & { key?: string }) {
    super(data);

    this.accountId = data.accountId;
    this.scheduleId = data.scheduleId;
    this.performerId = data.performerId;
  }
}
