import { ComparativeReportCellDto } from '../dto';
import { ComparativeReportValue } from './comparative-report-value';

export class ComparativeReportCell {
  date: string;
  all: ComparativeReportValue;
  open: ComparativeReportValue;
  lost: ComparativeReportValue;
  won: ComparativeReportValue;

  constructor(
    date: string,
    all: ComparativeReportValue,
    open: ComparativeReportValue,
    lost: ComparativeReportValue,
    won: ComparativeReportValue,
  ) {
    this.date = date;
    this.all = all;
    this.open = open;
    this.lost = lost;
    this.won = won;
  }

  public static empty(date: string): ComparativeReportCell {
    return new ComparativeReportCell(
      date,
      ComparativeReportValue.empty(),
      ComparativeReportValue.empty(),
      ComparativeReportValue.empty(),
      ComparativeReportValue.empty(),
    );
  }

  public toDto(): ComparativeReportCellDto {
    return {
      date: this.date,
      all: this.all.toDto(),
      open: this.open.toDto(),
      lost: this.lost.toDto(),
      won: this.won.toDto(),
    };
  }

  public add(cell: ComparativeReportCell): ComparativeReportCell {
    this.all.add(cell.all);
    this.open.add(cell.open);
    this.lost.add(cell.lost);
    this.won.add(cell.won);

    return this;
  }
}
