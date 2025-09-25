import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { SiteFormFieldDto } from './site-form-field.dto';

export class UpdateSiteFormFieldDto extends PartialType(
  PickType(SiteFormFieldDto, ['label', 'placeholder', 'isRequired', 'sortOrder', 'settings'] as const),
) {
  @ApiProperty()
  @IsNumber()
  id: number;
}
