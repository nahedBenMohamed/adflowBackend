export class RentalOrderEvent {
  accountId: number;
  entityId: number;
  rentalOrderId: number;

  constructor({ accountId, entityId, rentalOrderId }: RentalOrderEvent) {
    this.accountId = accountId;
    this.entityId = entityId;
    this.rentalOrderId = rentalOrderId;
  }
}
