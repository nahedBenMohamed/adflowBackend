import { ApiProperty } from '@nestjs/swagger';

import { ComparativeReportRowDto } from './comparative-report-row.dto';

export class ComparativeReportDto {
  @ApiProperty({ type: [ComparativeReportRowDto], description: 'Users' })
  users: ComparativeReportRowDto[];

  @ApiProperty({ type: [ComparativeReportRowDto], description: 'Departments' })
  departments: ComparativeReportRowDto[];

  @ApiProperty({ type: ComparativeReportRowDto, description: 'Total' })
  total: ComparativeReportRowDto;
}
