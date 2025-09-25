import { ServiceEvent } from '@/common';

export class SchedulerAppointmentExtEvent extends ServiceEvent {
  externalId?: string | null;
  accountId: number;
  scheduleId: number;
  appointmentId?: number | null;

  constructor(data: Omit<SchedulerAppointmentExtEvent, 'key' | 'checkHistory'> & { key?: string }) {
    super(data);

    this.externalId = data.externalId;
    this.accountId = data.accountId;
    this.scheduleId = data.scheduleId;
    this.appointmentId = data.appointmentId;
  }
}
