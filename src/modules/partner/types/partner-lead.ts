import { PartnerLeadDto } from '../dto';

export class PartnerLead {
  id: number;
  name: string;
  registrationDate: Date;
  paymentDate: Date | null;
  paymentAmount: number | null;
  partnerBonus: number | null;
  isPaidToPartner: boolean | null;

  constructor(
    id: number,
    name: string,
    registrationDate: Date,
    paymentDate: Date | null,
    paymentAmount: number | null,
    partnerBonus: number | null,
    isPaidToPartner: boolean | null,
  ) {
    this.id = id;
    this.name = name;
    this.registrationDate = registrationDate;
    this.paymentDate = paymentDate;
    this.paymentAmount = paymentAmount;
    this.partnerBonus = partnerBonus;
    this.isPaidToPartner = isPaidToPartner;
  }

  public toDto(): PartnerLeadDto {
    return new PartnerLeadDto({
      ...this,
      paymentDate: this.paymentDate?.toISOString(),
      registrationDate: this.registrationDate?.toISOString(),
    });
  }
}
