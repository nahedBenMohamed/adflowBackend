import { ComparativeReportDto } from '../dto/comparative-report.dto';
import { ComparativeReportRow } from './comparative-report-row';

export class ComparativeReport {
  users: Map<number, ComparativeReportRow>;
  departments: Map<number, ComparativeReportRow>;
  total: ComparativeReportRow | null;

  constructor(
    users: Map<number, ComparativeReportRow>,
    departments: Map<number, ComparativeReportRow>,
    total: ComparativeReportRow | null,
  ) {
    this.users = users;
    this.departments = departments;
    this.total = total;
  }

  public static empty(): ComparativeReport {
    return new ComparativeReport(
      new Map<number, ComparativeReportRow>(),
      new Map<number, ComparativeReportRow>(),
      ComparativeReportRow.empty(-1),
    );
  }

  public static createEmptyRow(ownerId: number): ComparativeReportRow {
    return ComparativeReportRow.empty(ownerId);
  }

  public toDto(): ComparativeReportDto {
    return {
      users: Array.from(this.users.values()).map((u) => u.toDto()),
      departments: Array.from(this.departments.values()).map((u) => u.toDto()),
      total: this.total?.toDto(),
    };
  }
}
