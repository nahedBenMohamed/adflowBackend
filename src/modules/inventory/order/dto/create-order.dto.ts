import { PickType } from '@nestjs/swagger';

import { OrderDto } from './order.dto';

export class CreateOrderDto extends PickType(OrderDto, [
  'entityId',
  'currency',
  'taxIncluded',
  'statusId',
  'warehouseId',
  'items',
  'cancelAfter',
] as const) {}
