import { ScheduleEvent } from './schedule.event';

export class ScheduleUpdatedEvent extends ScheduleEvent {
  typeChanged: boolean;
  timePeriodChanged: boolean;

  constructor({ accountId, userId, scheduleId, typeChanged, timePeriodChanged }: ScheduleUpdatedEvent) {
    super({ accountId, userId, scheduleId });
    this.typeChanged = typeChanged;
    this.timePeriodChanged = timePeriodChanged;
  }
}
