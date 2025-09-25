import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

import { RentalOrderDto } from './rental-order.dto';
import { CreateRentalOrderItemDto } from './create-rental-order-item.dto';

export class CreateRentalOrderDto extends OmitType(RentalOrderDto, [
  'id',
  'sectionId',
  'orderNumber',
  'createdBy',
  'createdAt',
  'items',
  'entityInfo',
] as const) {
  @ApiProperty()
  @IsNumber()
  entityId: number;

  @ApiProperty({ type: [CreateRentalOrderItemDto] })
  @IsArray()
  items: CreateRentalOrderItemDto[];
}
