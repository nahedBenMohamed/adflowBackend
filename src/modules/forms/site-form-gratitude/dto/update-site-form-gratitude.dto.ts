import { PartialType, PickType } from '@nestjs/swagger';

import { SiteFormGratitudeDto } from './site-form-gratitude.dto';

export class UpdateSiteFormGratitudeDto extends PartialType(
  PickType(SiteFormGratitudeDto, ['isEnabled', 'text', 'header'] as const),
) {}
