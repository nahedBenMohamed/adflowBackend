import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

import { PublicSiteFormFieldScheduleSpotDto } from './public-site-form-field-schedule-spot.dto';

export class PublicSiteFormFieldScheduleTimeDto {
  @ApiPropertyOptional({ type: [PublicSiteFormFieldScheduleSpotDto], nullable: true, description: 'Spots' })
  @IsOptional()
  @IsArray()
  spots?: PublicSiteFormFieldScheduleSpotDto[] | null;
}
