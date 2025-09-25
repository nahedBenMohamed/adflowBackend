import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { UserCalendarIntervalDto } from './user-calendar-interval.dto';

export class UserCalendarDto {
  @ApiPropertyOptional({ description: 'Time buffer before appointment in seconds' })
  @IsOptional()
  @IsNumber()
  timeBufferBefore?: number | null;

  @ApiPropertyOptional({ description: 'Time buffer after appointment in seconds' })
  @IsOptional()
  @IsNumber()
  timeBufferAfter?: number | null;

  @ApiPropertyOptional({ description: 'Appointments limit per day' })
  @IsOptional()
  @IsNumber()
  appointmentLimit?: number | null;

  @ApiPropertyOptional({ type: [UserCalendarIntervalDto], description: 'User calendar intervals' })
  @IsOptional()
  intervals?: UserCalendarIntervalDto[] | null;
}
