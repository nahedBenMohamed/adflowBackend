import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject } from 'class-validator';

import { ScheduleAppointmentStatus } from '../../common';

export class ScheduleAppointmentStatisticDto {
  @ApiProperty({ description: 'Total number of appointments' })
  @IsNumber()
  total: number;

  @ApiProperty({ description: 'Number of appointments grouped by status' })
  @IsObject()
  statuses: Record<ScheduleAppointmentStatus, number>;

  @ApiProperty({ description: 'Number of appointments which is first for linked entity' })
  @IsNumber()
  newbies: number;

  @ApiProperty({ description: 'Number of appointments without next appointment for same linked entity' })
  @IsNumber()
  notScheduled: number;

  @ApiProperty({ description: 'Number of appointments which is not took place' })
  @IsNumber()
  notTookPlace: number;
}
