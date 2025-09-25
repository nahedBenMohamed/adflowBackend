import { OmitType } from '@nestjs/swagger';
import { ProductsSectionDto } from './products-section.dto';

export class UpdateProductsSectionDto extends OmitType(ProductsSectionDto, [
  'id',
  'type',
  'entityTypeIds',
  'schedulerIds',
] as const) {}
