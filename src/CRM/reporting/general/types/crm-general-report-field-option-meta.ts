import type { FieldFormat } from '@/modules/entity/entity-field/field';
import { CrmGeneralReportFieldOptionMetaDto } from '../dto/crm-general-report-field-option-meta.dto';

export class CrmGeneralReportFieldOptionMeta {
  optionId: number;
  optionLabel: string | boolean;
  format?: FieldFormat | null;

  constructor(optionId: number, optionLabel: string | boolean, format?: FieldFormat | null) {
    this.optionId = optionId;
    this.optionLabel = optionLabel;
    this.format = format;
  }

  public toDto(): CrmGeneralReportFieldOptionMetaDto {
    return { optionId: this.optionId, optionLabel: this.optionLabel, format: this.format };
  }
}
