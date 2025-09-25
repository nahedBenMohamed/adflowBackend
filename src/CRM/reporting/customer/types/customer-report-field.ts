import { CustomerReportFieldDto } from '../dto/customer-report-field.dto';

export class CustomerReportField {
  fieldId: number;
  fieldName: string;
  value: number;

  constructor(fieldId: number, fieldName: string, value: number) {
    this.fieldId = fieldId;
    this.fieldName = fieldName;
    this.value = value;
  }

  public toDto(): CustomerReportFieldDto {
    return { fieldId: this.fieldId, fieldName: this.fieldName, value: this.value };
  }
}
