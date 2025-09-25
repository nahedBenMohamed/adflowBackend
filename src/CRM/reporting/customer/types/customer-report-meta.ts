import { CustomerReportMetaDto } from '../dto/customer-report-meta.dto';
import { type CustomerReportFieldMeta } from './customer-report-field-meta';

export class CustomerReportMeta {
  fields: CustomerReportFieldMeta[];
  offset: number;
  total: number;

  constructor({ offset, total, fields }: { offset: number; total: number; fields: CustomerReportFieldMeta[] }) {
    this.offset = offset;
    this.total = total;
    this.fields = fields;
  }

  public toDto(): CustomerReportMetaDto {
    return new CustomerReportMetaDto({
      offset: this.offset,
      total: this.total,
      fields: this.fields?.map((f) => f.toDto()),
    });
  }
}
