import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

import { ProductDto } from './product.dto';
import { CreateProductPriceDto } from '../../product-price/dto/create-product-price.dto';
import { CreateProductStockDto } from '../../product-stock/dto/create-product-stock.dto';

export class CreateProductDto extends PickType(ProductDto, [
  'name',
  'type',
  'description',
  'sku',
  'unit',
  'tax',
  'categoryId',
] as const) {
  @ApiProperty({ type: [CreateProductPriceDto] })
  @IsArray()
  prices: CreateProductPriceDto[];

  @ApiProperty({ type: [String] })
  @IsArray()
  photoFileIds: string[];

  @ApiProperty({ type: [CreateProductStockDto] })
  @IsArray()
  stocks: CreateProductStockDto[];
}
