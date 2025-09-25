import { ApiExtraModels, ApiPropertyOptional, PartialType, PickType, getSchemaPath } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

import { CreateSiteFormFieldDto, UpdateSiteFormFieldDto } from '../../site-form-field';
import { SiteFormPageDto } from './site-form-page.dto';

@ApiExtraModels(CreateSiteFormFieldDto)
@ApiExtraModels(UpdateSiteFormFieldDto)
export class UpdateSiteFormPageDto extends PartialType(
  PickType(SiteFormPageDto, ['id', 'title', 'sortOrder'] as const),
) {
  @ApiPropertyOptional({
    description: 'Array of form fields',
    type: 'array',
    items: {
      oneOf: [{ $ref: getSchemaPath(CreateSiteFormFieldDto) }, { $ref: getSchemaPath(UpdateSiteFormFieldDto) }],
    },
  })
  @IsOptional()
  @IsArray()
  fields?: (CreateSiteFormFieldDto | UpdateSiteFormFieldDto)[] | null;
}
