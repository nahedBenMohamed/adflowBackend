import { OmitType } from '@nestjs/swagger';

import { type OrderStatusCode } from '../enums/order-status-code.enum';
import { OrderStatusDto } from './order-status.dto';

export class CreateOrderStatusDto extends OmitType(OrderStatusDto, ['id'] as const) {
  constructor(name: string, color: string, code: OrderStatusCode | null, sortOrder: number) {
    super();

    this.name = name;
    this.color = color;
    this.code = code;
    this.sortOrder = sortOrder;
  }

  public static system(name: string, color: string, code: OrderStatusCode, sortOrder: number): CreateOrderStatusDto {
    return new CreateOrderStatusDto(name, color, code, sortOrder);
  }

  public static custom(name: string, color: string, sortOrder: number): CreateOrderStatusDto {
    return new CreateOrderStatusDto(name, color, null, sortOrder);
  }
}
