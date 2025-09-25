import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PartnerLeadDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  registrationDate: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  paymentDate: string | null;

  @ApiProperty()
  @IsNumber()
  paymentAmount: number;

  @ApiProperty()
  @IsNumber()
  partnerBonus: number;

  @ApiProperty()
  @IsNumber()
  isPaidToPartner: boolean;

  constructor({
    id,
    name,
    registrationDate,
    paymentDate,
    paymentAmount,
    partnerBonus,
    isPaidToPartner,
  }: PartnerLeadDto) {
    this.id = id;
    this.name = name;
    this.registrationDate = registrationDate;
    this.paymentDate = paymentDate;
    this.paymentAmount = paymentAmount;
    this.partnerBonus = partnerBonus;
    this.isPaidToPartner = isPaidToPartner;
  }
}
