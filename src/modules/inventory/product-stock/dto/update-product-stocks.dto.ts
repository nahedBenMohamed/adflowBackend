import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

import { UpdateProductStockDto } from './update-product-stock.dto';

export class UpdateProductStocksDto {
  @ApiProperty({ type: [UpdateProductStockDto], description: 'Product stocks' })
  @IsArray()
  stocks: UpdateProductStockDto[];
}
