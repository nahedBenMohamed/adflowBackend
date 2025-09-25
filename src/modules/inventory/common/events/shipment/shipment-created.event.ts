import { ShipmentEvent } from './shipment.event';

export class ShipmentCreatedEvent extends ShipmentEvent {
  entityId: number;
  createdAt: string;

  constructor({ accountId, sectionId, orderId, shipmentId, entityId, createdAt }: ShipmentCreatedEvent) {
    super({ accountId, sectionId, orderId, shipmentId });

    this.entityId = entityId;
    this.createdAt = createdAt;
  }
}
