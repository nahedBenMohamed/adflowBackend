import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { CalendarInfoDto } from './calendar-info.dto';

export class CalendarAccessDto {
  @ApiProperty({ type: CalendarInfoDto, isArray: true, description: 'List of calendar information' })
  @IsArray()
  calendarInfos: CalendarInfoDto[];

  @ApiProperty({ description: 'Access token' })
  @IsString()
  token: string;
}
