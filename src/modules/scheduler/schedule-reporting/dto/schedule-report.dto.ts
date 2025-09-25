import { ApiProperty } from '@nestjs/swagger';
import { ScheduleReportRowDto } from './schedule-report-row.dto';

export class ScheduleReportDto {
  @ApiProperty({ type: [ScheduleReportRowDto], description: 'Rows' })
  rows: ScheduleReportRowDto[];

  @ApiProperty({ type: ScheduleReportRowDto, description: 'Total' })
  total: ScheduleReportRowDto;
}
