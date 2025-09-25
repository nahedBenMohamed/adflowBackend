import { PartialType, PickType } from '@nestjs/swagger';

import { GoogleCalendarDto } from './google-calendar.dto';

export class UpdateGoogleCalendarDto extends PartialType(
  PickType(GoogleCalendarDto, ['title', 'type', 'objectId', 'responsibleId', 'linked', 'processAll'] as const),
) {}
