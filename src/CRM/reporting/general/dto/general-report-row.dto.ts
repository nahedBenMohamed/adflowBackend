import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { CallReportBlockDto } from '@/modules/telephony/voximplant/voximplant-reporting/dto/call-report-block.dto';
import { CrmGeneralReportEntityDto } from '@/CRM/reporting/general/dto/crm-general-report-entity.dto';
import { CrmGeneralReportFieldDto } from '@/CRM/reporting/general/dto/crm-general-report-field.dto';
import { CrmGeneralReportTaskDto } from '@/CRM/reporting/general/dto/crm-general-report-task.dto';

export class GeneralReportRowDto {
  @ApiProperty({ description: 'Owner ID' })
  @IsNumber()
  ownerId: number;

  @ApiPropertyOptional({ nullable: true, type: CrmGeneralReportEntityDto, description: 'Entities report block' })
  @IsOptional()
  entity?: CrmGeneralReportEntityDto | null;

  @ApiPropertyOptional({ nullable: true, type: CrmGeneralReportTaskDto, description: 'Tasks report block' })
  @IsOptional()
  task?: CrmGeneralReportTaskDto | null;

  @ApiPropertyOptional({ nullable: true, type: CrmGeneralReportTaskDto, description: 'Activities report block' })
  @IsOptional()
  activity?: CrmGeneralReportTaskDto | null;

  @ApiPropertyOptional({ nullable: true, type: [CrmGeneralReportFieldDto], description: 'Fields report block' })
  @IsOptional()
  fields?: CrmGeneralReportFieldDto[] | null;

  @ApiPropertyOptional({ nullable: true, type: CallReportBlockDto, description: 'Calls report block' })
  @IsOptional()
  call?: CallReportBlockDto | null;
}
