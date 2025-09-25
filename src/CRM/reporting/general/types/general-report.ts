import { GeneralReportDto } from '../dto';
import { CrmGeneralReportMeta } from './crm-general-report-meta';
import { GeneralReportRow } from './general-report-row';

export class GeneralReport {
  users: Map<number, GeneralReportRow>;
  departments: Map<number, GeneralReportRow>;
  total: GeneralReportRow;
  meta: CrmGeneralReportMeta;

  constructor(
    users: Map<number, GeneralReportRow>,
    departments: Map<number, GeneralReportRow>,
    total: GeneralReportRow,
    meta: CrmGeneralReportMeta,
  ) {
    this.users = users;
    this.departments = departments;
    this.total = total;
    this.meta = meta;
  }

  public toDto(): GeneralReportDto {
    return {
      users: Array.from(this.users.values()).map((u) => u.toDto()),
      departments: Array.from(this.departments.values()).map((u) => u.toDto()),
      total: this.total.toDto(),
      meta: this.meta.toDto(),
    };
  }
}
