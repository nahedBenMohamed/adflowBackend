import { ScheduleAppointmentStatus } from '../../enums';
import { SchedulerAppointmentExtEvent } from './schedule-appointment-ext.event';

export class SchedulerAppointmentExtUpsertEvent extends SchedulerAppointmentExtEvent {
  ownerId: number;
  performerId: number;
  title: string;
  comment?: string | null;
  startDate: Date;
  endDate: Date;
  status?: ScheduleAppointmentStatus | null;

  constructor(data: Omit<SchedulerAppointmentExtUpsertEvent, 'key' | 'checkHistory'> & { key?: string }) {
    super(data);

    this.ownerId = data.ownerId;
    this.performerId = data.performerId;
    this.title = data.title;
    this.comment = data.comment;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.status = data.status;
  }
}
