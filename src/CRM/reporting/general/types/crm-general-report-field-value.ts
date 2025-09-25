import { CrmGeneralReportFieldValueDto } from '../dto/crm-general-report-field-value.dto';

export class CrmGeneralReportFieldValue {
  optionId: number;
  optionLabel: string | boolean;
  quantity: number;
  amount: number;

  constructor(optionId: number, optionLabel: string | boolean, quantity: number, amount: number) {
    this.optionId = optionId;
    this.optionLabel = optionLabel;
    this.quantity = quantity;
    this.amount = amount;
  }

  public static empty(optionId: number, optionLabel: string | boolean): CrmGeneralReportFieldValue {
    return new CrmGeneralReportFieldValue(optionId, optionLabel, 0, 0);
  }

  public toDto(): CrmGeneralReportFieldValueDto {
    return new CrmGeneralReportFieldValueDto(this.optionId, this.optionLabel, this.quantity, this.amount);
  }

  public add(value: CrmGeneralReportFieldValue) {
    this.quantity += value.quantity;
    this.amount += value.amount;
  }
}
