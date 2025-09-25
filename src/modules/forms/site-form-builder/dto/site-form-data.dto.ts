import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

import { SiteFormFieldDataDto } from './site-form-field-data.dto';
import { SiteFormAnalyticDataDto } from './site-form-analytic-data.dto';

export class SiteFormDataDto {
  @ApiPropertyOptional({ description: 'Test' })
  @IsOptional()
  @IsString()
  test?: string;

  @ApiPropertyOptional({ type: [SiteFormFieldDataDto], nullable: true, description: 'Fields' })
  @IsOptional()
  @IsArray()
  @Type(() => SiteFormFieldDataDto)
  fields?: SiteFormFieldDataDto[] | null;

  @ApiPropertyOptional({ type: [SiteFormAnalyticDataDto], nullable: true, description: 'Analytics' })
  @IsOptional()
  @IsArray()
  @Type(() => SiteFormAnalyticDataDto)
  analytics?: SiteFormAnalyticDataDto[] | null;
}
