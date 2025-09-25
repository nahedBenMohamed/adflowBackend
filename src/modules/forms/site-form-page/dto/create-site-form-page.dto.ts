import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateSiteFormFieldDto } from '../../site-form-field';
import { SiteFormPageDto } from './site-form-page.dto';

export class CreateSiteFormPageDto extends PickType(SiteFormPageDto, ['title', 'sortOrder'] as const) {
  @ApiPropertyOptional({ type: [CreateSiteFormFieldDto], nullable: true })
  @IsOptional()
  @IsArray()
  @Type(() => CreateSiteFormFieldDto)
  fields?: CreateSiteFormFieldDto[] | null;
}
