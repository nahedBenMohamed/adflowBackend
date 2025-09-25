import { PickType } from '@nestjs/swagger';

import { SiteFormConsentDto } from './site-form-consent.dto';

export class CreateSiteFormConsentDto extends PickType(SiteFormConsentDto, [
  'isEnabled',
  'text',
  'linkUrl',
  'linkText',
  'defaultValue',
] as const) {}
