import { ShipmentEvent } from './shipment.event';

export class ShipmentStatusChangedEvent extends ShipmentEvent {
  statusId: number;

  constructor({ accountId, sectionId, orderId, shipmentId, statusId }: ShipmentStatusChangedEvent) {
    super({ accountId, sectionId, orderId, shipmentId });

    this.statusId = statusId;
  }
}
