import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CrmGeneralReportFieldValueDto {
  @ApiProperty()
  @IsNumber()
  optionId: number;

  @ApiProperty()
  optionLabel: string | boolean;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  amount: number;

  constructor(optionId: number, optionLabel: string | boolean, quantity: number, amount: number) {
    this.optionId = optionId;
    this.optionLabel = optionLabel;
    this.quantity = quantity;
    this.amount = amount;
  }
}
