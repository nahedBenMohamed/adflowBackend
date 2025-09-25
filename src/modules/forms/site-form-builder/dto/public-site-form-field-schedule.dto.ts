import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

import { PublicSiteFormOptionDto } from './public-site-form-option.dto';

export class PublicSiteFormFieldScheduleDto {
  @ApiPropertyOptional({ type: [PublicSiteFormOptionDto], nullable: true, description: 'Field options' })
  @IsOptional()
  @IsArray()
  options?: PublicSiteFormOptionDto[] | null;
}
