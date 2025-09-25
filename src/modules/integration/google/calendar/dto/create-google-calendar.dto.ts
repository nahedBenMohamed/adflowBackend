import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { GoogleCalendarDto } from './google-calendar.dto';

export class CreateGoogleCalendarDto extends PickType(GoogleCalendarDto, [
  'externalId',
  'title',
  'readonly',
  'type',
  'objectId',
  'responsibleId',
  'processAll',
  'linked',
] as const) {
  @ApiProperty({ description: 'Access token' })
  @IsString()
  token: string;

  @ApiPropertyOptional({ description: 'Sync events from today to future' })
  @IsOptional()
  @IsBoolean()
  syncEvents?: boolean;
}
