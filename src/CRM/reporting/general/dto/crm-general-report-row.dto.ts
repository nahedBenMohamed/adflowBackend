import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { CrmGeneralReportEntityDto } from './crm-general-report-entity.dto';
import { CrmGeneralReportTaskDto } from './crm-general-report-task.dto';
import { CrmGeneralReportFieldDto } from './crm-general-report-field.dto';

export class CrmGeneralReportRowDto {
  @ApiProperty()
  @IsNumber()
  ownerId: number;

  @ApiProperty({ type: CrmGeneralReportEntityDto })
  entity: CrmGeneralReportEntityDto;

  @ApiProperty({ type: CrmGeneralReportTaskDto })
  task: CrmGeneralReportTaskDto;

  @ApiProperty({ type: CrmGeneralReportTaskDto })
  activity: CrmGeneralReportTaskDto;

  @ApiProperty({ type: [CrmGeneralReportFieldDto] })
  fields: CrmGeneralReportFieldDto[];

  constructor(
    ownerId: number,
    entity: CrmGeneralReportEntityDto,
    task: CrmGeneralReportTaskDto,
    activity: CrmGeneralReportTaskDto,
    fields: CrmGeneralReportFieldDto[],
  ) {
    this.ownerId = ownerId;
    this.entity = entity;
    this.task = task;
    this.activity = activity;
    this.fields = fields;
  }
}
