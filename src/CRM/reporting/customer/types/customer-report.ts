import { CustomerReportDto } from '../dto';

import { type CustomerReportRow } from './customer-report-row';
import { type CustomerReportMeta } from './customer-report-meta';

export class CustomerReport {
  rows: CustomerReportRow[];
  total: CustomerReportRow | null;
  meta: CustomerReportMeta;

  constructor(rows: CustomerReportRow[], total: CustomerReportRow | null, meta: CustomerReportMeta) {
    this.rows = rows;
    this.total = total;
    this.meta = meta;
  }

  public toDto(): CustomerReportDto {
    return {
      rows: this.rows.map((r) => r.toDto()),
      total: this.total?.toDto(),
      meta: this.meta.toDto(),
    };
  }
}
