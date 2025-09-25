import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { ProductStockDto } from './product-stock.dto';

export class UpdateProductStockDto extends OmitType(ProductStockDto, [
  'reserved',
  'available',
  'stockQuantity',
] as const) {
  @ApiProperty({ nullable: true, description: 'Stock quantity' })
  @IsOptional()
  @IsNumber()
  stockQuantity: number | null;
}
