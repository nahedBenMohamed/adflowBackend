import { ApiExtraModels, ApiPropertyOptional, PartialType, PickType, getSchemaPath } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

import { CreateSiteFormConsentDto, UpdateSiteFormConsentDto } from '../../site-form-consent';
import { CreateSiteFormGratitudeDto, UpdateSiteFormGratitudeDto } from '../../site-form-gratitude';
import { CreateSiteFormPageDto, UpdateSiteFormPageDto } from '../../site-form-page';

import { SiteFormDto } from './site-form.dto';

@ApiExtraModels(CreateSiteFormConsentDto)
@ApiExtraModels(UpdateSiteFormConsentDto)
@ApiExtraModels(CreateSiteFormGratitudeDto)
@ApiExtraModels(UpdateSiteFormGratitudeDto)
@ApiExtraModels(CreateSiteFormPageDto)
@ApiExtraModels(UpdateSiteFormPageDto)
export class UpdateSiteFormDto extends PartialType(
  PickType(SiteFormDto, [
    'type',
    'name',
    'isActive',
    'title',
    'isHeadless',
    'responsibleId',
    'design',
    'entityTypeLinks',
    'fieldLabelEnabled',
    'fieldPlaceholderEnabled',
    'multiformEnabled',
    'scheduleLimitDays',
    'checkDuplicate',
    'scheduleLinks',
  ] as const),
) {
  @ApiPropertyOptional({
    description: 'Form consent',
    type: 'array',
    items: {
      oneOf: [{ $ref: getSchemaPath(CreateSiteFormConsentDto) }, { $ref: getSchemaPath(UpdateSiteFormConsentDto) }],
    },
  })
  @IsOptional()
  consent?: CreateSiteFormConsentDto | UpdateSiteFormConsentDto | null;

  @ApiPropertyOptional({
    description: 'Form gratitude',
    type: 'array',
    items: {
      oneOf: [{ $ref: getSchemaPath(CreateSiteFormGratitudeDto) }, { $ref: getSchemaPath(UpdateSiteFormGratitudeDto) }],
    },
  })
  @IsOptional()
  gratitude?: CreateSiteFormGratitudeDto | UpdateSiteFormGratitudeDto | null;

  @ApiPropertyOptional({
    description: 'Form pages',
    type: 'array',
    items: { oneOf: [{ $ref: getSchemaPath(CreateSiteFormPageDto) }, { $ref: getSchemaPath(UpdateSiteFormPageDto) }] },
  })
  @IsOptional()
  @IsArray()
  pages?: (CreateSiteFormPageDto | UpdateSiteFormPageDto)[] | null;
}
