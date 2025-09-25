import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { ProjectReportItemDto } from './project-report-item.dto';
import { ProjectStageItemDto } from './project-stage-item.dto';

export class ProjectTaskUserReportTotalRowDto {
  @ApiProperty({ type: () => ProjectReportItemDto, description: 'Open tasks' })
  opened: ProjectReportItemDto;

  @ApiProperty({ type: () => ProjectReportItemDto, description: 'Done tasks' })
  done: ProjectReportItemDto;

  @ApiProperty({ type: () => ProjectReportItemDto, description: 'Overdue tasks' })
  overdue: ProjectReportItemDto;

  @ApiProperty({ type: [ProjectStageItemDto], description: 'Tasks by project stages' })
  stages: ProjectStageItemDto[];

  @ApiProperty({ description: 'Planned time' })
  @IsNumber()
  planedTime: number;

  @ApiProperty({ description: 'Completion percent' })
  @IsNumber()
  completionPercent: number;
}
