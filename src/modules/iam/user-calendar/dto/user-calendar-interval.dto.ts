import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserCalendarIntervalDto {
  @ApiProperty({ description: 'Day of week', examples: ['Monday', 'Sunday'] })
  @IsString()
  dayOfWeek: string;

  @ApiProperty({ description: 'Interval time from', examples: ['09:00', '21:00'] })
  @IsString()
  timeFrom: string;

  @ApiProperty({ description: 'Interval time to', examples: ['09:00', '21:00'] })
  @IsString()
  timeTo: string;
}
