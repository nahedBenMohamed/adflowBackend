import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

import { PublicSiteFormConsentDto } from './public-site-form-consent.dto';
import { PublicSiteFormGratitudeDto } from './public-site-form-gratitude.dto';
import { PublicSiteFormPageDto } from './public-site-form-page.dto';

export class PublicSiteFormDto {
  @ApiProperty({ description: 'Site form code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ nullable: true, description: 'Site form title' })
  @IsOptional()
  @IsString()
  title?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Site form design' })
  @IsOptional()
  @IsObject()
  design: object | null;

  @ApiPropertyOptional({ description: 'Site form field label enabled' })
  @IsOptional()
  @IsBoolean()
  fieldLabelEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Site form field placeholder enabled' })
  @IsOptional()
  @IsBoolean()
  fieldPlaceholderEnabled?: boolean;

  @ApiPropertyOptional({ type: PublicSiteFormConsentDto, nullable: true, description: 'Site form consent' })
  @IsOptional()
  consent?: PublicSiteFormConsentDto | null;

  @ApiPropertyOptional({ type: PublicSiteFormGratitudeDto, nullable: true, description: 'Site form gratitude' })
  @IsOptional()
  gratitude?: PublicSiteFormGratitudeDto | null;

  @ApiPropertyOptional({ type: [PublicSiteFormPageDto], nullable: true, description: 'Site form pages' })
  @IsOptional()
  @IsArray()
  pages?: PublicSiteFormPageDto[] | null;
}
