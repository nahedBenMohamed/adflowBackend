import { OmitType } from '@nestjs/swagger';
import { ProductPriceDto } from './product-price.dto';

export class UpdateProductPriceDto extends OmitType(ProductPriceDto, ['id'] as const) {}
