import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

import { ProductDto } from './product.dto';
import { GetProductsMeta } from './get-products.meta';

export class GetProductsResult {
  @ApiProperty({ type: [ProductDto] })
  @IsArray()
  products: ProductDto[];

  @ApiProperty()
  @IsNotEmpty()
  meta: GetProductsMeta;

  constructor(products: ProductDto[], meta: GetProductsMeta) {
    this.products = products;
    this.meta = meta;
  }
}
