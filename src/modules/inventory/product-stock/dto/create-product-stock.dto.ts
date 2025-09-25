import { OmitType } from '@nestjs/swagger';
import { ProductStockDto } from './product-stock.dto';

export class CreateProductStockDto extends OmitType(ProductStockDto, ['reserved', 'available'] as const) {}
