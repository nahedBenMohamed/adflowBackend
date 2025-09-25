import { SchedulePerformerEvent } from './schedule-performer.event';

export class SchedulePerformerDeletedEvent extends SchedulePerformerEvent {
  newPerformerId?: number | null;

  constructor(data: Omit<SchedulePerformerDeletedEvent, 'key' | 'checkHistory'> & { key?: string }) {
    super(data);

    this.newPerformerId = data.newPerformerId;
  }
}
