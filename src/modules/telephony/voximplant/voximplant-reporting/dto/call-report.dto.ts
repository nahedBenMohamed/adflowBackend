import { ApiProperty } from '@nestjs/swagger';

import { CallReportRowDto } from './call-report-row.dto';

export class CallReportDto {
  @ApiProperty({ type: [CallReportRowDto], description: 'Call report rows for users' })
  users: CallReportRowDto[];

  @ApiProperty({ type: [CallReportRowDto], description: 'Call report rows for departments' })
  departments: CallReportRowDto[];

  @ApiProperty({ type: CallReportRowDto, description: 'Total call report row' })
  total: CallReportRowDto;
}
