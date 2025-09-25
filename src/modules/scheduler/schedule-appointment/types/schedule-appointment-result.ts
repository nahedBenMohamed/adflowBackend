import { PagingMeta } from '@/common';

import { ScheduleAppointmentResultDto } from '../dto/schedule-appointment-result.dto';
import { type ScheduleAppointment } from '../entities/schedule-appointment.entity';

export class ScheduleAppointmentResult {
  appointments: ScheduleAppointment[];
  offset: number;
  total: number;

  constructor(appointments: ScheduleAppointment[], offset: number, total: number) {
    this.appointments = appointments;
    this.offset = offset;
    this.total = total;
  }

  public toDto(): ScheduleAppointmentResultDto {
    return new ScheduleAppointmentResultDto(
      this.appointments.map((appointment) => appointment.toDto()),
      new PagingMeta(this.offset, this.total),
    );
  }
}
