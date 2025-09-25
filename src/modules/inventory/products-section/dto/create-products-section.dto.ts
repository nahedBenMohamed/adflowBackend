import { OmitType } from '@nestjs/swagger';
import { ProductsSectionDto } from './products-section.dto';

export class CreateProductsSectionDto extends OmitType(ProductsSectionDto, [
  'id',
  'entityTypeIds',
  'schedulerIds',
] as const) {}
