import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { ProjectReportItemDto } from './project-report-item.dto';

export class ProjectStageItemDto {
  @ApiProperty({ description: 'Stage ID' })
  @IsNumber()
  stageId: number;

  @ApiProperty({ type: ProjectReportItemDto, description: 'Project report item' })
  item: ProjectReportItemDto;
}
