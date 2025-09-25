import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CustomerReportRowDto } from './customer-report-row.dto';
import { CustomerReportMetaDto } from './customer-report-meta.dto';

export class CustomerReportDto {
  @ApiProperty({ type: [CustomerReportRowDto], description: 'Rows' })
  rows: CustomerReportRowDto[];

  @ApiPropertyOptional({ type: CustomerReportRowDto, nullable: true, description: 'Total' })
  total?: CustomerReportRowDto | null;

  @ApiProperty({ type: CustomerReportMetaDto, description: 'Meta' })
  meta: CustomerReportMetaDto;
}
