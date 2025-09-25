import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { ProjectReportItemDto } from './project-report-item.dto';
import { ProjectStageItemDto } from './project-stage-item.dto';

export class ProjectTaskUserReportRowDto {
  @ApiProperty({ description: 'User ID' })
  @IsNumber()
  userId: number;

  @ApiProperty({ type: () => ProjectReportItemDto, description: 'Opened tasks' })
  opened: ProjectReportItemDto;

  @ApiProperty({ type: () => ProjectReportItemDto, description: 'Done tasks' })
  done: ProjectReportItemDto;

  @ApiProperty({ type: () => ProjectReportItemDto, description: 'Overdue tasks' })
  overdue: ProjectReportItemDto;

  @ApiProperty({ type: [ProjectStageItemDto], description: 'Tasks by stages' })
  stages: ProjectStageItemDto[];

  @ApiProperty({ description: 'Planned time' })
  @IsNumber()
  planedTime: number;

  @ApiProperty({ description: 'Completion percent' })
  @IsNumber()
  completionPercent: number;
}
