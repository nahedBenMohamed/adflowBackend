import { ApiProperty } from '@nestjs/swagger';
import { CrmGeneralReportFieldMetaDto } from './crm-general-report-field-meta.dto';

export class CrmGeneralReportMetaDto {
  @ApiProperty({ type: [CrmGeneralReportFieldMetaDto] })
  fields: CrmGeneralReportFieldMetaDto[];
}
