import { PickType } from '@nestjs/swagger';
import { ProductDto } from './product.dto';

export class UpdateProductDto extends PickType(ProductDto, [
  'name',
  'description',
  'sku',
  'unit',
  'tax',
  'categoryId',
] as const) {}
