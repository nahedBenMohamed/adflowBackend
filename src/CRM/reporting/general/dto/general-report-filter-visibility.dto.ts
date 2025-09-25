import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { GeneralReportFilterVisibilityEntityDto } from './general-report-filter-visibility-entity.dto';
import { GeneralReportFilterVisibilityTaskDto } from './general-report-filter-visibility-task.dto';
import { GeneralReportFilterVisibilityFieldsDto } from './general-report-filter-visibility-fields.dto';
import { GeneralReportFilterVisibilityCallDto } from './general-report-filter-visibility-call.dto';

export class GeneralReportFilterVisibilityDto {
  @ApiPropertyOptional({
    type: GeneralReportFilterVisibilityEntityDto,
    nullable: true,
    description: 'Entities visibility',
  })
  @IsOptional()
  entity?: GeneralReportFilterVisibilityEntityDto | null;

  @ApiPropertyOptional({ type: GeneralReportFilterVisibilityTaskDto, nullable: true, description: 'Tasks visibility' })
  @IsOptional()
  task?: GeneralReportFilterVisibilityTaskDto | null;

  @ApiPropertyOptional({
    type: GeneralReportFilterVisibilityTaskDto,
    nullable: true,
    description: 'Activities visibility',
  })
  @IsOptional()
  activity?: GeneralReportFilterVisibilityTaskDto | null;

  @ApiPropertyOptional({
    type: GeneralReportFilterVisibilityFieldsDto,
    nullable: true,
    description: 'Fields visibility',
  })
  @IsOptional()
  fields?: GeneralReportFilterVisibilityFieldsDto | null;

  @ApiPropertyOptional({ type: GeneralReportFilterVisibilityCallDto, nullable: true, description: 'Calls visibility' })
  @IsOptional()
  call?: GeneralReportFilterVisibilityCallDto | null;
}
