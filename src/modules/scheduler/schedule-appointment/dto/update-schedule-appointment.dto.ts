import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

import { ScheduleAppointmentDto } from './schedule-appointment.dto';

export class UpdateScheduleAppointmentDto extends PartialType(
  OmitType(ScheduleAppointmentDto, ['id', 'ownerId', 'createdAt', 'userRights', 'order', 'entityInfo'] as const),
) {
  @ApiPropertyOptional({ description: 'Check intersection with other appointments' })
  @IsOptional()
  @IsBoolean()
  checkIntersection?: boolean;

  @ApiPropertyOptional({ description: 'Owner id' })
  @IsOptional()
  @IsNumber()
  ownerId?: number;
}
