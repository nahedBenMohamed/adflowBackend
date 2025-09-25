import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { SchedulerAppointmentExtUpsertEvent, SchedulerEventType, ScheduleUpdatedEvent } from '../common';
import { ScheduleAppointmentService } from './schedule-appointment.service';

@Injectable()
export class ScheduleAppointmentHandler {
  constructor(private readonly service: ScheduleAppointmentService) {}

  @OnEvent(SchedulerEventType.ScheduleUpdated, { async: true })
  public async onUserDeleted(event: ScheduleUpdatedEvent) {
    if (event.typeChanged || event.timePeriodChanged) {
      await this.service.delete({ accountId: event.accountId, filter: { scheduleId: event.scheduleId } });
    }
  }

  @OnEvent(SchedulerEventType.ScheduleAppointmentUpsertExt, { async: true })
  public async onTaskUpsertExt(event: SchedulerAppointmentExtUpsertEvent) {
    await this.service.handleUpsertExt(event);
  }
}
