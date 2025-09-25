import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class PartnerSummaryDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  registrationsCount: number;

  @ApiProperty()
  @IsNumber()
  payingLeadsCount: number;

  @ApiProperty()
  @IsNumber()
  totalPayments: number;

  @ApiProperty()
  @IsNumber()
  totalPartnerBonus: number;

  constructor({ id, name, registrationsCount, payingLeadsCount, totalPayments, totalPartnerBonus }: PartnerSummaryDto) {
    this.id = id;
    this.name = name;
    this.registrationsCount = registrationsCount;
    this.payingLeadsCount = payingLeadsCount;
    this.totalPayments = totalPayments;
    this.totalPartnerBonus = totalPartnerBonus;
  }
}
