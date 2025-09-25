import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional } from 'class-validator';

import { FieldType } from '@/modules/entity/entity-field/common';

import { PublicSiteFormOptionDto } from './public-site-form-option.dto';

export class PublicSiteFormFieldEntityFieldDto {
  @ApiProperty({ enum: FieldType, description: 'Field type' })
  @IsEnum(FieldType)
  fieldType: FieldType;

  @ApiPropertyOptional({ type: [PublicSiteFormOptionDto], nullable: true, description: 'Field options' })
  @IsOptional()
  @IsArray()
  options?: PublicSiteFormOptionDto[] | null;

  @ApiPropertyOptional({ nullable: true, description: 'Field validation required' })
  @IsOptional()
  @IsBoolean()
  isValidationRequired: boolean | null;

  @ApiPropertyOptional({ nullable: true, description: 'Field validation pattern' })
  @IsOptional()
  @IsObject()
  meta?: object | null;
}
