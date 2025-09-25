import { ApiProperty } from '@nestjs/swagger';

import { CrmGeneralReportMetaDto } from './crm-general-report-meta.dto';
import { CrmGeneralReportRowDto } from './crm-general-report-row.dto';

export class CrmGeneralReportDto {
  @ApiProperty({ type: [CrmGeneralReportRowDto] })
  users: CrmGeneralReportRowDto[];

  @ApiProperty({ type: [CrmGeneralReportRowDto] })
  departments: CrmGeneralReportRowDto[];

  @ApiProperty({ type: CrmGeneralReportRowDto })
  total: CrmGeneralReportRowDto;

  @ApiProperty({ type: CrmGeneralReportMetaDto })
  meta: CrmGeneralReportMetaDto;

  constructor(
    users: CrmGeneralReportRowDto[],
    departments: CrmGeneralReportRowDto[],
    total: CrmGeneralReportRowDto,
    meta: CrmGeneralReportMetaDto,
  ) {
    this.users = users;
    this.departments = departments;
    this.total = total;
    this.meta = meta;
  }
}
