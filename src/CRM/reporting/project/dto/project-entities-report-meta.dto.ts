import { ApiProperty } from '@nestjs/swagger';

import { ProjectReportFieldMetaDto } from './project-report-field-meta.dto';

export class ProjectEntitiesReportMetaDto {
  @ApiProperty({ type: [ProjectReportFieldMetaDto], description: 'Fields meta' })
  fields: ProjectReportFieldMetaDto[];
}
