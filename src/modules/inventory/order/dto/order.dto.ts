import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { Currency } from '@/common';

import { OrderItemDto } from './order-item.dto';

export class OrderDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  sectionId: number;

  @ApiProperty()
  @IsNumber()
  entityId: number;

  @ApiProperty()
  @IsNumber()
  orderNumber: number;

  @ApiProperty()
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty()
  @IsBoolean()
  taxIncluded: boolean;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  statusId: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  warehouseId?: number | null;

  @ApiProperty()
  @IsNumber()
  createdBy: number;

  @ApiProperty()
  @IsString()
  createdAt: string;

  @ApiProperty()
  @IsString()
  updatedAt: string;

  @ApiPropertyOptional({ nullable: true, description: 'in hours' })
  @IsOptional()
  @IsNumber()
  cancelAfter?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  shippedAt?: string | null;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  items: OrderItemDto[];

  constructor({
    id,
    sectionId,
    entityId,
    orderNumber,
    totalAmount,
    currency,
    taxIncluded,
    statusId,
    warehouseId,
    createdBy,
    createdAt,
    updatedAt,
    cancelAfter,
    shippedAt,
    items,
  }: OrderDto) {
    this.id = id;
    this.sectionId = sectionId;
    this.entityId = entityId;
    this.orderNumber = orderNumber;
    this.totalAmount = totalAmount;
    this.currency = currency;
    this.taxIncluded = taxIncluded;
    this.statusId = statusId;
    this.warehouseId = warehouseId;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.cancelAfter = cancelAfter;
    this.shippedAt = shippedAt;
    this.items = items;
  }
}
