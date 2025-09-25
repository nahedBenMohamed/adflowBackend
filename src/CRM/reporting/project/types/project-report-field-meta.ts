import { ProjectReportFieldMetaDto } from '../dto';

export class ProjectReportFieldMeta {
  fieldId: number;
  fieldName: string;

  constructor(fieldId: number, fieldName: string) {
    this.fieldId = fieldId;
    this.fieldName = fieldName;
  }

  public toDto(): ProjectReportFieldMetaDto {
    return { fieldId: this.fieldId, fieldName: this.fieldName };
  }
}
