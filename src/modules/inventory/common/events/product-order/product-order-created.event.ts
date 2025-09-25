import { ProductOrderEvent } from './product-order.event';

export class ProductOrderCreatedEvent extends ProductOrderEvent {
  createdAt: string;

  constructor({ accountId, entityId, orderId, createdAt }: ProductOrderCreatedEvent) {
    super({ accountId, entityId, orderId });
    this.createdAt = createdAt;
  }
}
