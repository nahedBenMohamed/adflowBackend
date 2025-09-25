import { ScheduleAppointmentStatus } from '../../enums';
import { SchedulerAppointmentEvent } from './schedule-appointment.event';

export class SchedulerAppointmentCreatedEvent extends SchedulerAppointmentEvent {
  title: string;
  comment: string;
  startDate: Date;
  endDate: Date;
  status: ScheduleAppointmentStatus;

  constructor(data: Omit<SchedulerAppointmentCreatedEvent, 'key' | 'checkHistory'> & { key?: string }) {
    super(data);

    this.title = data.title;
    this.comment = data.comment;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.status = data.status;
  }
}
