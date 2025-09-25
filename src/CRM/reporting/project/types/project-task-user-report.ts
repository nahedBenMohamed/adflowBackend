import { ProjectTaskUserReportDto } from '../dto';
import { type ProjectTaskUserReportRow } from './project-task-user-report-row';
import { type ProjectTaskUserReportTotalRow } from './project-task-user-report-total-row';

export class ProjectTaskUserReport {
  rows: ProjectTaskUserReportRow[];
  total: ProjectTaskUserReportTotalRow;

  constructor(rows: ProjectTaskUserReportRow[], total: ProjectTaskUserReportTotalRow) {
    this.rows = rows;
    this.total = total;
  }

  public toDto(): ProjectTaskUserReportDto {
    return { rows: this.rows.map((r) => r.toDto()), total: this.total.toDto() };
  }
}
