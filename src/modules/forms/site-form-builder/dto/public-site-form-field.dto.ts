import { ApiExtraModels, ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { SiteFormFieldType } from '../../site-form-field';
import { PublicSiteFormFieldEntityFieldDto } from './public-site-form-field-entity-field.dto';
import { PublicSiteFormFieldScheduleDto } from './public-site-form-field-schedule.dto';
import { PublicSiteFormFieldScheduleDateDto } from './public-site-form-field-schedule-date.dto';
import { PublicSiteFormFieldScheduleTimeDto } from './public-site-form-field-schedule-time.dto';

@ApiExtraModels(PublicSiteFormFieldEntityFieldDto)
@ApiExtraModels(PublicSiteFormFieldScheduleDto)
@ApiExtraModels(PublicSiteFormFieldScheduleDateDto)
@ApiExtraModels(PublicSiteFormFieldScheduleTimeDto)
export class PublicSiteFormFieldDto {
  @ApiProperty({ description: 'Site form field id' })
  @IsNumber()
  id: number;

  @ApiPropertyOptional({ nullable: true, description: 'Site form field label' })
  @IsOptional()
  @IsString()
  label: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Site form field placeholder' })
  @IsOptional()
  @IsString()
  placeholder: string | null;

  @ApiProperty({ enum: SiteFormFieldType, description: 'Site form field type' })
  @IsString()
  @IsEnum(SiteFormFieldType)
  type: SiteFormFieldType;

  @ApiPropertyOptional({ nullable: true, description: 'Site form field required' })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean | null;

  @ApiProperty({ description: 'Site form field sort order' })
  @IsNumber()
  sortOrder: number;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Site form field settings',
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(PublicSiteFormFieldEntityFieldDto) },
        { $ref: getSchemaPath(PublicSiteFormFieldScheduleDto) },
        { $ref: getSchemaPath(PublicSiteFormFieldScheduleDateDto) },
        { $ref: getSchemaPath(PublicSiteFormFieldScheduleTimeDto) },
      ],
    },
  })
  @IsOptional()
  settings?:
    | PublicSiteFormFieldEntityFieldDto
    | PublicSiteFormFieldScheduleDto
    | PublicSiteFormFieldScheduleDateDto
    | PublicSiteFormFieldScheduleTimeDto
    | null;
}
