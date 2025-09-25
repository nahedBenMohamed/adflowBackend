import { CrmGeneralReportFieldMetaDto } from '../dto';

import { CrmGeneralReportFieldOptionMeta } from './crm-general-report-field-option-meta';

export class CrmGeneralReportFieldMeta {
  fieldId: number;
  fieldName: string;
  options?: CrmGeneralReportFieldOptionMeta[] | null;

  constructor(fieldId: number, fieldName: string, options?: CrmGeneralReportFieldOptionMeta[] | null) {
    this.fieldId = fieldId;
    this.fieldName = fieldName;
    this.options = options;
  }

  public toDto(): CrmGeneralReportFieldMetaDto {
    return {
      fieldId: this.fieldId,
      fieldName: this.fieldName,
      values: this.options?.map((o) => o.toDto()),
    };
  }
}
