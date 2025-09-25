import { ApiProperty } from '@nestjs/swagger';

import { CrmGeneralReportMetaDto } from '@/CRM/reporting/general/dto/crm-general-report-meta.dto';
import { GeneralReportRowDto } from './general-report-row.dto';

export class GeneralReportDto {
  @ApiProperty({ type: [GeneralReportRowDto], description: 'Users' })
  users: GeneralReportRowDto[];

  @ApiProperty({ type: [GeneralReportRowDto], description: 'Departments' })
  departments: GeneralReportRowDto[];

  @ApiProperty({ type: GeneralReportRowDto, description: 'Total' })
  total: GeneralReportRowDto;

  @ApiProperty({ type: CrmGeneralReportMetaDto, description: 'Meta' })
  meta: CrmGeneralReportMetaDto;
}
