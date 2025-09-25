import { ProjectReportFieldDto } from '../dto';

export class ProjectReportField {
  fieldId: number;
  fieldName: string;
  value: number;

  constructor(fieldId: number, fieldName: string, value: number) {
    this.fieldId = fieldId;
    this.fieldName = fieldName;
    this.value = value;
  }

  public toDto(): ProjectReportFieldDto {
    return { fieldId: this.fieldId, fieldName: this.fieldName, value: this.value };
  }
}
