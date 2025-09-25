import { OmitType } from '@nestjs/swagger';
import { ProductPriceDto } from './product-price.dto';

export class CreateProductPriceDto extends OmitType(ProductPriceDto, ['id'] as const) {}
