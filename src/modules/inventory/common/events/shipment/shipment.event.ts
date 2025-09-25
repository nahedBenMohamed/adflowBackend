export class ShipmentEvent {
  accountId: number;
  sectionId: number;
  orderId: number;
  shipmentId: number;

  constructor({ accountId, sectionId, orderId, shipmentId }: ShipmentEvent) {
    this.accountId = accountId;
    this.sectionId = sectionId;
    this.orderId = orderId;
    this.shipmentId = shipmentId;
  }
}
