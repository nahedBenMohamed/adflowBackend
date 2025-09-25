import { PartnerSummaryDto } from '../dto';

export class PartnerSummary {
  id: number;
  name: string;
  registrationsCount: number;
  payingLeadsCount: number;
  totalPayments: number;
  totalPartnerBonus: number;

  constructor(
    id: number,
    name: string,
    registrationsCount: number,
    payingLeadsCount: number,
    totalPayments: number,
    totalPartnerBonus: number,
  ) {
    this.id = id;
    this.name = name;
    this.registrationsCount = registrationsCount;
    this.payingLeadsCount = payingLeadsCount;
    this.totalPayments = totalPayments;
    this.totalPartnerBonus = totalPartnerBonus;
  }

  public toDto(): PartnerSummaryDto {
    return new PartnerSummaryDto(this);
  }
}
