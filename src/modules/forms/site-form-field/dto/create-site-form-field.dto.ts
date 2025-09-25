import { PickType } from '@nestjs/swagger';

import { SiteFormFieldDto } from './site-form-field.dto';

export class CreateSiteFormFieldDto extends PickType(SiteFormFieldDto, [
  'label',
  'placeholder',
  'type',
  'isRequired',
  'sortOrder',
  'settings',
] as const) {}
