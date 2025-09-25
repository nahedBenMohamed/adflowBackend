import { CustomerReportFieldMetaDto } from '../dto/customer-report-field-meta.dto';

export class CustomerReportFieldMeta {
  fieldId: number;
  fieldName: string;

  constructor(fieldId: number, fieldName: string) {
    this.fieldId = fieldId;
    this.fieldName = fieldName;
  }

  public toDto(): CustomerReportFieldMetaDto {
    return { fieldId: this.fieldId, fieldName: this.fieldName };
  }
}
