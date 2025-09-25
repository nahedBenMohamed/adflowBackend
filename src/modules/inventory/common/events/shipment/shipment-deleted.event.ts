import { ShipmentEvent } from './shipment.event';

export class ShipmentDeletedEvent extends ShipmentEvent {
  entityId: number;

  constructor({ accountId, sectionId, orderId, shipmentId, entityId }: ShipmentDeletedEvent) {
    super({ accountId, sectionId, orderId, shipmentId });

    this.entityId = entityId;
  }
}
