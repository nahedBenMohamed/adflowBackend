import { PickType } from '@nestjs/swagger';
import { ProductCategoryDto } from './product-category.dto';

export class CreateProductCategoryDto extends PickType(ProductCategoryDto, ['name', 'parentId'] as const) {}
