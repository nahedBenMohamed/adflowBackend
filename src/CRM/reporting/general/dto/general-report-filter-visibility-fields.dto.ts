import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { GeneralReportFilterVisibilityFieldDto } from './general-report-filter-visibility-field.dto';

export class GeneralReportFilterVisibilityFieldsDto {
  @ApiPropertyOptional({ nullable: true, description: 'Exclude fields block' })
  @IsOptional()
  @IsBoolean()
  exclude?: boolean | null;

  @ApiPropertyOptional({ type: [GeneralReportFilterVisibilityFieldDto], nullable: true, description: 'Fields' })
  @IsOptional()
  fields?: GeneralReportFilterVisibilityFieldDto[] | null;
}
