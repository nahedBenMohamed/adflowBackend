import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { DatePeriodDto } from '@/common';
import { ScheduleAppointmentStatus } from '../../common';

export class ScheduleAppointmentFilterDto extends DatePeriodDto {
  @ApiPropertyOptional({ description: 'Schedule ID' })
  @IsOptional()
  @IsNumber()
  scheduleId?: number;

  @ApiPropertyOptional({ description: 'Linked entity ID' })
  @IsOptional()
  @IsNumber()
  entityId?: number;

  @ApiPropertyOptional({ description: 'Performer ID' })
  @IsOptional()
  @IsNumber()
  performerId?: number;

  @ApiPropertyOptional({ description: 'Show canceled appointments' })
  @IsOptional()
  @IsBoolean()
  showCanceled?: boolean;

  @ApiPropertyOptional({ description: 'Appointment title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ enum: ScheduleAppointmentStatus, isArray: true, description: 'Appointment status' })
  @IsOptional()
  @IsEnum(ScheduleAppointmentStatus, { each: true })
  status?: ScheduleAppointmentStatus | ScheduleAppointmentStatus[];

  @ApiPropertyOptional({ description: 'Show only appointments which is first for linked entity' })
  @IsOptional()
  @IsBoolean()
  isNewbie?: boolean;

  @ApiPropertyOptional({ description: 'Show only appointments without next appointment for same linked entity' })
  @IsOptional()
  @IsBoolean()
  isNotScheduled?: boolean;

  @ApiPropertyOptional({ description: 'Show only appointments which is not took place' })
  @IsOptional()
  @IsBoolean()
  isNotTookPlace?: boolean;
}
