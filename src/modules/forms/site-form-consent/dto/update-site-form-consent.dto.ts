import { PartialType, PickType } from '@nestjs/swagger';

import { SiteFormConsentDto } from './site-form-consent.dto';

export class UpdateSiteFormConsentDto extends PartialType(
  PickType(SiteFormConsentDto, ['isEnabled', 'text', 'linkUrl', 'linkText', 'defaultValue'] as const),
) {}
