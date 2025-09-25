import { ScheduleReportDto } from '../dto';
import { ScheduleReportRow } from './schedule-report-row';

export class ScheduleReport {
  rows: Map<number, ScheduleReportRow>;
  total: ScheduleReportRow;

  constructor(rows: Map<number, ScheduleReportRow>, total: ScheduleReportRow) {
    this.rows = rows;
    this.total = total;
  }

  public static createEmptyRow(ownerId: number): ScheduleReportRow {
    return ScheduleReportRow.empty(ownerId);
  }

  public toDto(): ScheduleReportDto {
    return {
      rows: Array.from(this.rows.values()).map((row) => row.toDto()),
      total: this.total.toDto(),
    };
  }
}
