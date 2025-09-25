import { PickType } from '@nestjs/swagger';

import { SiteFormGratitudeDto } from './site-form-gratitude.dto';

export class CreateSiteFormGratitudeDto extends PickType(SiteFormGratitudeDto, [
  'isEnabled',
  'header',
  'text',
] as const) {}
