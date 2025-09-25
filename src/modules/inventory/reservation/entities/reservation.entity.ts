import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { ReservationDto } from '../dto';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  orderId: number;

  @Column()
  orderItemId: number;

  @Column()
  productId: number;

  @Column()
  warehouseId: number;

  @Column()
  quantity: number;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(
    accountId: number,
    orderId: number,
    orderItemId: number,
    productId: number,
    warehouseId: number,
    quantity: number,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.orderId = orderId;
    this.orderItemId = orderItemId;
    this.productId = productId;
    this.warehouseId = warehouseId;
    this.quantity = quantity;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public static fromDto(
    accountId: number,
    orderId: number,
    orderItemId: number,
    productId: number,
    dto: ReservationDto,
  ): Reservation {
    return new Reservation(accountId, orderId, orderItemId, productId, dto.warehouseId, dto.quantity);
  }

  public toDto(): ReservationDto {
    return new ReservationDto(this.warehouseId, this.quantity);
  }
}
