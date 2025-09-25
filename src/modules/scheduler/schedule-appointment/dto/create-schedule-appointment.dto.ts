import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNumber, IsOptional } from 'class-validator';

import { ScheduleAppointmentDto } from './schedule-appointment.dto';

export class CreateScheduleAppointmentDto extends PickType(ScheduleAppointmentDto, [
  'scheduleId',
  'startDate',
  'status',
  'title',
  'comment',
  'entityId',
  'performerId',
  'orderId',
  'externalId',
] as const) {
  @ApiPropertyOptional({ description: 'Appointment end date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Check intersection with other appointments' })
  @IsOptional()
  @IsBoolean()
  checkIntersection?: boolean;

  @ApiPropertyOptional({ description: 'Owner id' })
  @IsOptional()
  @IsNumber()
  ownerId?: number;
}
