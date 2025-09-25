import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

import { RentalOrderDto } from './rental-order.dto';
import { UpdateRentalOrderItemDto } from './update-rental-order-item.dto';

export class UpdateRentalOrderDto extends OmitType(RentalOrderDto, [
  'id',
  'sectionId',
  'orderNumber',
  'createdBy',
  'createdAt',
  'items',
  'entityInfo',
] as const) {
  @ApiProperty({ type: [UpdateRentalOrderItemDto] })
  @IsArray()
  items: UpdateRentalOrderItemDto[];
}
