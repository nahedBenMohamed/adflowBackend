import { ApiExtraModels, ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { SiteFormFieldType } from '../enums';
import { SiteFormFieldEntityFieldDto } from './site-form-field-entity-field.dto';
import { SiteFormFieldEntityNameDto } from './site-form-field-entity-name.dto';

@ApiExtraModels(SiteFormFieldEntityFieldDto)
@ApiExtraModels(SiteFormFieldEntityNameDto)
export class SiteFormFieldDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  label: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  placeholder: string | null;

  @ApiProperty({ enum: SiteFormFieldType })
  @IsEnum(SiteFormFieldType)
  type: SiteFormFieldType;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean | null;

  @ApiProperty()
  @IsNumber()
  sortOrder: number;

  @ApiPropertyOptional({
    nullable: true,
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(SiteFormFieldEntityFieldDto) },
        { $ref: getSchemaPath(SiteFormFieldEntityNameDto) },
      ],
    },
  })
  @IsOptional()
  settings?: SiteFormFieldEntityFieldDto | SiteFormFieldEntityNameDto | null;
}
