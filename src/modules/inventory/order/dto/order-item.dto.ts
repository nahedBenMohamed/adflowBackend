import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsObject, IsOptional } from 'class-validator';

import { ReservationDto } from '../../reservation/dto/reservation.dto';
import { ProductInfoDto } from '../../product/dto/product-info.dto';

export class OrderItemDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  tax: number;

  @ApiProperty()
  @IsNumber()
  discount: number;

  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNumber()
  sortOrder: number;

  @ApiProperty({ type: ProductInfoDto, required: false })
  @IsOptional()
  @IsObject()
  productInfo: ProductInfoDto | undefined;

  @ApiProperty({ type: [ReservationDto], required: false })
  @IsOptional()
  @IsArray()
  reservations: ReservationDto[] | undefined;

  constructor(
    id: number,
    unitPrice: number,
    quantity: number,
    tax: number,
    discount: number,
    productId: number,
    sortOrder: number,
    productInfo: ProductInfoDto | undefined,
    reservations: ReservationDto[] | undefined,
  ) {
    this.id = id;
    this.unitPrice = unitPrice;
    this.quantity = quantity;
    this.tax = tax;
    this.discount = discount;
    this.productId = productId;
    this.sortOrder = sortOrder;
    this.productInfo = productInfo;
    this.reservations = reservations;
  }
}
