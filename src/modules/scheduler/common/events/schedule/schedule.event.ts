export class ScheduleEvent {
  accountId: number;
  userId: number;
  scheduleId: number;

  constructor({ accountId, userId, scheduleId }: ScheduleEvent) {
    this.accountId = accountId;
    this.userId = userId;
    this.scheduleId = scheduleId;
  }
}
