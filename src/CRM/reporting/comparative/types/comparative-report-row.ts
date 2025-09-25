import { ComparativeReportRowDto } from '../dto';
import { ComparativeReportCell } from './comparative-report-cell';

export class ComparativeReportRow {
  ownerId: number;
  cells: Map<string, ComparativeReportCell>;

  constructor(ownerId: number, cells: Map<string, ComparativeReportCell>) {
    this.ownerId = ownerId;
    this.cells = cells;
  }

  public static empty(ownerId: number): ComparativeReportRow {
    return new ComparativeReportRow(ownerId, new Map<string, ComparativeReportCell>());
  }

  public toDto(): ComparativeReportRowDto {
    return {
      ownerId: this.ownerId,
      cells: Array.from(this.cells.values()).map((v) => v.toDto()),
    };
  }

  public add(row: ComparativeReportRow): ComparativeReportRow {
    for (const [rowCellId, rowCell] of row.cells) {
      let cell = this.cells.get(rowCellId);
      if (!cell) {
        cell = ComparativeReportCell.empty(rowCellId);
        this.cells.set(rowCellId, cell);
      }
      cell.add(rowCell);
    }

    return this;
  }
}
