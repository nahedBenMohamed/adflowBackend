import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ShipmentItemDto } from '../dto';

@Entity()
export class ShipmentItem {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  shipmentId: number;

  @Column()
  productId: number;

  @Column()
  quantity: number;

  constructor(accountId: number, shipmentId: number, productId: number, quantity: number) {
    this.accountId = accountId;
    this.shipmentId = shipmentId;
    this.productId = productId;
    this.quantity = quantity;
  }

  public toDto(): ShipmentItemDto {
    return { id: this.id, productId: this.productId, quantity: this.quantity };
  }
}
