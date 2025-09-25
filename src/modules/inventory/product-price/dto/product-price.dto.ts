import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { Currency } from '@/common';

export class ProductPriceDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  name: string | null;

  @ApiProperty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  maxDiscount: number | null;

  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  currency: Currency;

  constructor(id: number, name: string | null, unitPrice: number, currency: Currency, maxDiscount: number | null) {
    this.id = id;
    this.name = name;
    this.unitPrice = unitPrice;
    this.currency = currency;
    this.maxDiscount = maxDiscount;
  }
}
