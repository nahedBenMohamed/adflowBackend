import { RentalOrderEvent } from './rental-order.event';

export class RentalOrderCreatedEvent extends RentalOrderEvent {
  createdAt: string;

  constructor({ accountId, entityId, rentalOrderId, createdAt }: RentalOrderCreatedEvent) {
    super({ accountId, entityId, rentalOrderId });
    this.createdAt = createdAt;
  }
}
