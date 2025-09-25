import { PickType } from '@nestjs/swagger';
import { ProductCategoryDto } from './product-category.dto';

export class UpdateProductCategoryDto extends PickType(ProductCategoryDto, ['name'] as const) {}
