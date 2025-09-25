import { CallReportDto } from '../dto';
import { CallReportRow } from './call-report-row';

export class CallReport {
  users: Map<number, CallReportRow>;
  departments: Map<number, CallReportRow>;
  total: CallReportRow;

  constructor({
    users,
    departments,
    total,
  }: {
    users: Map<number, CallReportRow>;
    departments: Map<number, CallReportRow>;
    total: CallReportRow;
  }) {
    this.users = users;
    this.departments = departments;
    this.total = total;
  }

  public toDto(): CallReportDto {
    return {
      users: Array.from(this.users.values()).map((u) => u.toDto()),
      departments: Array.from(this.departments.values()).map((u) => u.toDto()),
      total: this.total.toDto(),
    };
  }
}
