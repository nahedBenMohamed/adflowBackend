import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { FileLinkDto } from '@/CRM/Service/FileLink/FileLinkDto';

import { ProductType } from '../enums/product-type.enum';
import { ProductPriceDto } from '../../product-price/dto/product-price.dto';
import { ProductStockDto } from '../../product-stock/dto/product-stock.dto';
import { RentalScheduleStatus } from '../../rental-schedule/enums';
import { RentalEventDto } from '../../rental-schedule/dto/rental-event.dto';

export class ProductDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  sectionId: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ProductType })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  description: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  sku: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  unit: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  tax: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  categoryId: number | null;

  @ApiProperty()
  @IsString()
  updatedAt: string;

  @ApiProperty({ type: [ProductPriceDto] })
  @IsArray()
  prices: ProductPriceDto[];

  @ApiProperty({ type: [FileLinkDto] })
  @IsArray()
  photoFileLinks: FileLinkDto[];

  @ApiProperty({ type: [ProductStockDto] })
  @IsArray()
  stocks: ProductStockDto[];

  @ApiPropertyOptional({ nullable: true, enum: RentalScheduleStatus })
  @IsOptional()
  @IsEnum(RentalScheduleStatus)
  rentalStatus: RentalScheduleStatus | null;

  @ApiPropertyOptional({ nullable: true, type: [RentalEventDto] })
  @IsOptional()
  @IsArray()
  rentalEvents: RentalEventDto[] | null;

  constructor(
    id: number,
    sectionId: number,
    name: string,
    type: ProductType,
    description: string | null,
    sku: string | null,
    unit: string | null,
    tax: number | null,
    categoryId: number | null,
    updatedAt: string,
    prices: ProductPriceDto[],
    photoFileLinks: FileLinkDto[],
    stocks: ProductStockDto[],
    rentalStatus: RentalScheduleStatus | null,
    rentalEvents: RentalEventDto[] | null,
  ) {
    this.id = id;
    this.sectionId = sectionId;
    this.name = name;
    this.type = type;
    this.description = description;
    this.sku = sku;
    this.unit = unit;
    this.tax = tax;
    this.categoryId = categoryId;
    this.updatedAt = updatedAt;
    this.prices = prices;
    this.photoFileLinks = photoFileLinks;
    this.stocks = stocks;
    this.rentalStatus = rentalStatus;
    this.rentalEvents = rentalEvents;
  }
}
