import { ApiProperty } from '@nestjs/swagger';

import { PagingMeta } from '@/common';

import { ScheduleAppointmentDto } from './schedule-appointment.dto';

export class ScheduleAppointmentResultDto {
  @ApiProperty({ type: [ScheduleAppointmentDto], description: 'List of schedule appointments' })
  appointments: ScheduleAppointmentDto[];

  @ApiProperty({ type: PagingMeta, description: 'Paging metadata' })
  meta: PagingMeta;

  constructor(appointments: ScheduleAppointmentDto[], meta: PagingMeta) {
    this.appointments = appointments;
    this.meta = meta;
  }
}
