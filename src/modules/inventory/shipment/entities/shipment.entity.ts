import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';
import { EntityInfoDto } from '@/modules/entity/entity-info/dto';

import { Authorizable, AuthorizableObject, SimpleAuthorizable } from '@/modules/iam/common';

import { PermissionObjectType } from '../../common';

import { ShipmentDto } from '../dto';
import { ShipmentItem } from './shipment-item.entity';

@Entity()
export class Shipment implements Authorizable {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  sectionId: number;

  @Column()
  name: string;

  @Column()
  warehouseId: number;

  @Column()
  entityId: number;

  @Column()
  orderId: number;

  @Column()
  orderNumber: number;

  @Column()
  statusId: number;

  @Column()
  shippedAt: Date | null;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(
    accountId: number,
    sectionId: number,
    name: string,
    warehouseId: number,
    entityId: number,
    orderId: number,
    orderNumber: number,
    statusId: number,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.sectionId = sectionId;
    this.name = name;
    this.warehouseId = warehouseId;
    this.entityId = entityId;
    this.orderId = orderId;
    this.orderNumber = orderNumber;
    this.statusId = statusId;
    this.shippedAt = null;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  private _items: ShipmentItem[] | null;
  public get items(): ShipmentItem[] | null {
    return this._items;
  }
  public set items(value: ShipmentItem[] | null) {
    this._items = value;
  }

  private _entityInfo: EntityInfoDto | null;
  public get entityInfo(): EntityInfoDto | null {
    return this._entityInfo;
  }
  public set entityInfo(value: EntityInfoDto | null) {
    this._entityInfo = value;
  }

  static getAuthorizable(sectionId: number): Authorizable {
    return new SimpleAuthorizable({ type: PermissionObjectType.ProductsShipment, id: sectionId });
  }
  getAuthorizableObject(): AuthorizableObject {
    return {
      type: PermissionObjectType.ProductsShipment,
      id: this.sectionId,
    };
  }

  public toDto(): ShipmentDto {
    return {
      id: this.id,
      sectionId: this.sectionId,
      name: this.name,
      warehouseId: this.warehouseId,
      orderId: this.orderId,
      orderNumber: this.orderNumber,
      statusId: this.statusId,
      createdAt: this.createdAt.toISOString(),
      shippedAt: this.shippedAt ? this.shippedAt.toISOString() : null,
      items: this.items ? this.items.map((item) => item.toDto()) : [],
      entityInfo: this.entityInfo,
    };
  }
}
