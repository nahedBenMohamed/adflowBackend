export class EntityPriceUpdateEvent {
  accountId: number;
  entityId: number;
  price: number;

  constructor({ accountId, entityId, price }: EntityPriceUpdateEvent) {
    this.accountId = accountId;
    this.entityId = entityId;
    this.price = price;
  }
}
