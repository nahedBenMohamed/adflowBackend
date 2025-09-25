import { CrmGeneralReportDto } from '../dto/crm-general-report.dto';
import { type CrmGeneralReportMeta } from './crm-general-report-meta';
import { CrmGeneralReportRow } from './crm-general-report-row';

export class CrmGeneralReport {
  users: Map<number, CrmGeneralReportRow>;
  departments: Map<number, CrmGeneralReportRow>;
  total: CrmGeneralReportRow | null;
  meta: CrmGeneralReportMeta;

  constructor(
    users: Map<number, CrmGeneralReportRow>,
    departments: Map<number, CrmGeneralReportRow>,
    total: CrmGeneralReportRow | null,
    meta: CrmGeneralReportMeta,
  ) {
    this.users = users;
    this.departments = departments;
    this.total = total;
    this.meta = meta;
  }

  public static createEmptyRow(ownerId: number, useWon: boolean): CrmGeneralReportRow {
    return CrmGeneralReportRow.empty(ownerId, useWon);
  }

  public toDto(): CrmGeneralReportDto {
    return new CrmGeneralReportDto(
      Array.from(this.users.values()).map((u) => u.toDto()),
      Array.from(this.departments.values()).map((u) => u.toDto()),
      this.total?.toDto(),
      this.meta.toDto(),
    );
  }
}
