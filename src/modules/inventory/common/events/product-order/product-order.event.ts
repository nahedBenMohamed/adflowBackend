export class ProductOrderEvent {
  accountId: number;
  entityId: number;
  orderId: number;

  constructor({ accountId, entityId, orderId }: ProductOrderEvent) {
    this.accountId = accountId;
    this.entityId = entityId;
    this.orderId = orderId;
  }
}
