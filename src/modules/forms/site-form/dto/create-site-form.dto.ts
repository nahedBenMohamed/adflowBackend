import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateSiteFormConsentDto } from '../../site-form-consent';
import { CreateSiteFormGratitudeDto } from '../../site-form-gratitude';
import { CreateSiteFormPageDto } from '../../site-form-page';

import { SiteFormDto } from './site-form.dto';

export class CreateSiteFormDto extends PickType(SiteFormDto, [
  'type',
  'name',
  'title',
  'responsibleId',
  'design',
  'fieldLabelEnabled',
  'fieldPlaceholderEnabled',
  'multiformEnabled',
  'scheduleLimitDays',
  'checkDuplicate',
  'entityTypeLinks',
  'scheduleLinks',
] as const) {
  @ApiPropertyOptional({ description: 'Is form headless' })
  @IsOptional()
  @IsBoolean()
  isHeadless?: boolean;

  @ApiPropertyOptional({ type: CreateSiteFormConsentDto, nullable: true, description: 'Form consent' })
  @IsOptional()
  @Type(() => CreateSiteFormConsentDto)
  consent?: CreateSiteFormConsentDto | null;

  @ApiPropertyOptional({ type: CreateSiteFormGratitudeDto, nullable: true, description: 'Form gratitude' })
  @IsOptional()
  @Type(() => CreateSiteFormGratitudeDto)
  gratitude?: CreateSiteFormGratitudeDto | null;

  @ApiPropertyOptional({ type: [CreateSiteFormPageDto], nullable: true, description: 'Form pages' })
  @IsOptional()
  @IsArray()
  @Type(() => CreateSiteFormPageDto)
  pages?: CreateSiteFormPageDto[] | null;
}
