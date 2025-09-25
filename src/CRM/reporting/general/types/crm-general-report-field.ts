import { CrmGeneralReportFieldDto } from '../dto/crm-general-report-field.dto';
import { CrmGeneralReportFieldValue } from './crm-general-report-field-value';

export class CrmGeneralReportField {
  fieldId: number;
  fieldName: string;
  values: Map<number, CrmGeneralReportFieldValue>;

  constructor(fieldId: number, fieldName: string, values: Map<number, CrmGeneralReportFieldValue>) {
    this.fieldId = fieldId;
    this.fieldName = fieldName;
    this.values = values;
  }

  public static empty(fieldId: number, fieldName: string): CrmGeneralReportField {
    return new CrmGeneralReportField(fieldId, fieldName, new Map<number, CrmGeneralReportFieldValue>());
  }

  public toDto(): CrmGeneralReportFieldDto {
    return new CrmGeneralReportFieldDto(
      this.fieldId,
      this.fieldName,
      Array.from(this.values.values()).map((v) => v.toDto()),
    );
  }

  public add(field: CrmGeneralReportField) {
    for (const [fieldValueId, fieldValue] of field.values) {
      let value = this.values.get(fieldValueId);
      if (!value) {
        value = CrmGeneralReportFieldValue.empty(fieldValueId, fieldValue.optionLabel);
        this.values.set(fieldValueId, value);
      }
      value.add(fieldValue);
    }
  }
}
