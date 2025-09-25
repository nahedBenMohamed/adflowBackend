import { ApiProperty } from '@nestjs/swagger';

import { ProjectTaskUserReportRowDto } from './project-task-user-report-row.dto';
import { ProjectTaskUserReportTotalRowDto } from './project-task-user-report-total-row.dto';

export class ProjectTaskUserReportDto {
  @ApiProperty({ type: [ProjectTaskUserReportRowDto], description: 'Project task user report rows' })
  rows: ProjectTaskUserReportRowDto[];

  @ApiProperty({ type: ProjectTaskUserReportTotalRowDto, description: 'Project task user report total row' })
  total: ProjectTaskUserReportTotalRowDto;
}
