import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { ProjectReportItemDto } from './project-report-item.dto';
import { ProjectStageItemDto } from './project-stage-item.dto';
import { ProjectReportFieldDto } from './project-report-field.dto';

export class ProjectEntitiesReportRowDto {
  @ApiProperty({ description: 'Entity ID' })
  @IsNumber()
  entityId: number;

  @ApiProperty({ description: 'Entity name' })
  @IsString()
  entityName: string;

  @ApiProperty({ type: () => ProjectReportItemDto, description: 'All tasks' })
  all: ProjectReportItemDto;

  @ApiProperty({ type: () => ProjectReportItemDto, description: 'Done tasks' })
  done: ProjectReportItemDto;

  @ApiProperty({ type: () => ProjectReportItemDto, description: 'Overdue tasks' })
  overdue: ProjectReportItemDto;

  @ApiProperty({ type: [ProjectStageItemDto], description: 'Tasks by project stages' })
  stages: ProjectStageItemDto[];

  @ApiProperty({ nullable: true, description: 'Project stage ID' })
  @IsOptional()
  @IsNumber()
  projectStageId: number | null;

  @ApiProperty({ description: 'Completion percent' })
  @IsNumber()
  completionPercent: number;

  @ApiPropertyOptional({ type: [ProjectReportFieldDto], nullable: true, description: 'Fields' })
  @IsOptional()
  fields: ProjectReportFieldDto[] | null;
}
