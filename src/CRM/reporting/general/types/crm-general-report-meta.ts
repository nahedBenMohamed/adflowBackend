import { CrmGeneralReportMetaDto } from '../dto/crm-general-report-meta.dto';
import { type CrmGeneralReportFieldMeta } from './crm-general-report-field-meta';

export class CrmGeneralReportMeta {
  fields: CrmGeneralReportFieldMeta[];

  constructor(fields: CrmGeneralReportFieldMeta[]) {
    this.fields = fields;
  }

  public toDto(): CrmGeneralReportMetaDto {
    return { fields: this.fields.map((u) => u.toDto()) };
  }
}
