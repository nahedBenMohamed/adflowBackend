import { ServiceEvent } from '@/common';

export class SchedulerAppointmentEvent extends ServiceEvent {
  accountId: number;
  ownerId: number;
  scheduleId: number;
  performerId: number;
  appointmentId: number;
  entityId: number | null;
  externalId?: string | null;

  constructor(data: Omit<SchedulerAppointmentEvent, 'key' | 'checkHistory'> & { key?: string }) {
    super(data);

    this.accountId = data.accountId;
    this.ownerId = data.ownerId;
    this.scheduleId = data.scheduleId;
    this.performerId = data.performerId;
    this.appointmentId = data.appointmentId;
    this.entityId = data.entityId;
    this.externalId = data.externalId;
  }
}
