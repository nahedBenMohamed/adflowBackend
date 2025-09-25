import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Currency, DateUtil } from '@/common';

import { Authorizable, AuthorizableObject, SimpleAuthorizable } from '@/modules/iam/common';

import { PermissionObjectType } from '../../common';
import { Shipment } from '../../shipment/entities/shipment.entity';

import { CreateOrderDto, UpdateOrderDto, OrderDto } from '../dto';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order implements Authorizable {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  sectionId: number;

  @Column({
    type: 'numeric',
    transformer: {
      to: (value: number) => value,
      from: (value: unknown) => Number(value),
    },
  })
  totalAmount: number;

  @Column()
  currency: Currency;

  @Column()
  taxIncluded: boolean;

  @Column({ nullable: true })
  statusId: number | null;

  @Column()
  warehouseId: number | null;

  @Column()
  entityId: number;

  @Column()
  orderNumber: number;

  @Column()
  createdBy: number;

  @Column({ nullable: true })
  cancelAfter: number | null;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  _items: OrderItem[];

  _shipments: Shipment[];

  constructor(
    accountId: number,
    sectionId: number,
    totalAmount: number,
    currency: Currency,
    taxIncluded: boolean,
    statusId: number | null,
    warehouseId: number | null,
    entityId: number,
    orderNumber: number,
    createdBy: number,
    cancelAfter: number | null,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.sectionId = sectionId;
    this.totalAmount = totalAmount;
    this.currency = currency;
    this.taxIncluded = taxIncluded;
    this.statusId = statusId;
    this.warehouseId = warehouseId;
    this.entityId = entityId;
    this.orderNumber = orderNumber;
    this.createdBy = createdBy;
    this.cancelAfter = cancelAfter;
    this.createdAt = createdAt ?? DateUtil.now();
    this.updatedAt = createdAt ?? DateUtil.now();
  }

  public get items(): OrderItem[] {
    return this._items;
  }
  public set items(value: OrderItem[]) {
    this._items = value;
  }

  public get shipments(): Shipment[] {
    return this._shipments;
  }
  public set shipments(value: Shipment[]) {
    this._shipments = value;
  }

  static getAuthorizable(sectionId: number): Authorizable {
    return new SimpleAuthorizable({ type: PermissionObjectType.ProductsOrder, id: sectionId });
  }
  getAuthorizableObject(): AuthorizableObject {
    return {
      type: PermissionObjectType.ProductsOrder,
      id: this.sectionId,
      createdBy: this.createdBy,
    };
  }

  public static fromDto(
    accountId: number,
    sectionId: number,
    orderNumber: number,
    createdBy: number,
    totalAmount: number,
    dto: CreateOrderDto,
  ): Order {
    return new Order(
      accountId,
      sectionId,
      totalAmount,
      dto.currency,
      dto.taxIncluded,
      dto.statusId,
      dto.warehouseId,
      dto.entityId,
      orderNumber,
      createdBy,
      dto.cancelAfter,
    );
  }

  public updateFromDto(totalAmount: number, dto: UpdateOrderDto): Order {
    this.currency = dto.currency;
    this.taxIncluded = dto.taxIncluded;
    this.statusId = dto.statusId;
    this.warehouseId = dto.warehouseId;
    this.totalAmount = totalAmount;
    this.cancelAfter = dto.cancelAfter !== undefined ? dto.cancelAfter : this.cancelAfter;
    this.updatedAt = DateUtil.now();

    return this;
  }

  public toDto(): OrderDto {
    const shippedAt = this._shipments ? this._shipments.find((s) => s.shippedAt !== null)?.shippedAt : null;
    return new OrderDto({
      id: this.id,
      sectionId: this.sectionId,
      entityId: this.entityId,
      orderNumber: this.orderNumber,
      totalAmount: this.totalAmount,
      currency: this.currency,
      taxIncluded: this.taxIncluded,
      statusId: this.statusId,
      warehouseId: this.warehouseId,
      createdBy: this.createdBy,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      cancelAfter: this.cancelAfter,
      shippedAt: shippedAt?.toISOString() ?? null,
      items: this._items ? this._items.map((i) => i.toDto()) : [],
    });
  }
}
