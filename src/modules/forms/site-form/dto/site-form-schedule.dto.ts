import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SiteFormScheduleDto {
  @ApiProperty({ description: 'Schedule ID' })
  @IsNumber()
  scheduleId: number;
}
