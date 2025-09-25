import { PagingMeta } from '@/common';

import { ShipmentResultDto } from '../dto';
import { Shipment } from '../entities';

export class ShipmentResult {
  shipments: Shipment[];
  offset: number;
  total: number;

  constructor(shipments: Shipment[], offset: number, total: number) {
    this.shipments = shipments;
    this.offset = offset;
    this.total = total;
  }

  public toDto(): ShipmentResultDto {
    return {
      shipments: this.shipments.map((shipment) => shipment.toDto()),
      meta: new PagingMeta(this.offset, this.total),
    };
  }
}
