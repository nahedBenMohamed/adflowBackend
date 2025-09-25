import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';

import { CalendarType } from '../enums';

export class GoogleCalendarLinkedDto {
  @ApiProperty({ enum: CalendarType, description: 'Linked object type' })
  @IsEnum(CalendarType)
  type: CalendarType;

  @ApiProperty({ description: 'Linked object ID' })
  @IsNumber()
  objectId: number;
}
