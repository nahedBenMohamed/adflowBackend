import { PickType } from '@nestjs/swagger';

import { OrderDto } from './order.dto';

export class UpdateOrderDto extends PickType(OrderDto, [
  'currency',
  'taxIncluded',
  'statusId',
  'warehouseId',
  'items',
  'cancelAfter',
] as const) {}
