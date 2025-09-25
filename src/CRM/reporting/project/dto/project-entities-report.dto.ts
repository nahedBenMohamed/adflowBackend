import { ApiProperty } from '@nestjs/swagger';

import { ProjectEntitiesReportRowDto } from './project-entities-report-row.dto';
import { ProjectEntitiesReportMetaDto } from './project-entities-report-meta.dto';

export class ProjectEntitiesReportDto {
  @ApiProperty({ type: [ProjectEntitiesReportRowDto], description: 'Rows' })
  rows: ProjectEntitiesReportRowDto[];

  @ApiProperty({ type: ProjectEntitiesReportRowDto, description: 'Total' })
  total: ProjectEntitiesReportRowDto;

  @ApiProperty({ type: ProjectEntitiesReportMetaDto, description: 'Meta' })
  meta: ProjectEntitiesReportMetaDto;
}
