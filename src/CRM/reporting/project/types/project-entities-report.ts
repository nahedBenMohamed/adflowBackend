import { ProjectEntitiesReportDto } from '../dto';
import { type ProjectEntitiesReportMeta } from './project-entities-report-meta';
import { type ProjectEntitiesReportRow } from './project-entities-report-row';

export class ProjectEntitiesReport {
  rows: ProjectEntitiesReportRow[];
  total: ProjectEntitiesReportRow;
  meta: ProjectEntitiesReportMeta;

  constructor(rows: ProjectEntitiesReportRow[], total: ProjectEntitiesReportRow, meta: ProjectEntitiesReportMeta) {
    this.rows = rows;
    this.total = total;
    this.meta = meta;
  }

  public toDto(): ProjectEntitiesReportDto {
    return { rows: this.rows.map((d) => d.toDto()), total: this.total.toDto(), meta: this.meta.toDto() };
  }
}
