import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class RentalOrderItemDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty()
  @IsNumber()
  tax: number;

  @ApiProperty()
  @IsNumber()
  discount: number;

  @ApiProperty()
  @IsNumber()
  sortOrder: number;

  constructor(id: number, productId: number, unitPrice: number, tax: number, discount: number, sortOrder: number) {
    this.id = id;
    this.productId = productId;
    this.unitPrice = unitPrice;
    this.tax = tax;
    this.discount = discount;
    this.sortOrder = sortOrder;
  }
}
