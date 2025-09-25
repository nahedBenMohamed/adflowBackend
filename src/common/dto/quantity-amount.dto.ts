import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class QuantityAmountDto {
  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Amount' })
  @IsNumber()
  amount: number;

  constructor(quantity: number, amount: number) {
    this.quantity = quantity;
    this.amount = amount;
  }

  public static empty(): QuantityAmountDto {
    return new QuantityAmountDto(0, 0);
  }
}
