import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

import { PublicSiteFormFieldDto } from './public-site-form-field.dto';

export class PublicSiteFormPageDto {
  @ApiProperty({ description: 'Site form page id' })
  @IsNumber()
  id: number;

  @ApiPropertyOptional({ nullable: true, description: 'Site form page title' })
  @IsOptional()
  @IsString()
  title?: string | null;

  @ApiProperty({ description: 'Site form page sort order' })
  @IsNumber()
  sortOrder: number;

  @ApiProperty({ type: [PublicSiteFormFieldDto], description: 'Site form page fields' })
  @IsArray()
  fields: PublicSiteFormFieldDto[];
}
