import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Currency, DateUtil } from '@/common';

import { Authorizable, AuthorizableObject, SimpleAuthorizable } from '@/modules/iam/common';
import { EntityInfoDto } from '@/modules/entity/entity-info/dto/entity-info.dto';

import { PermissionObjectType } from '../../common';

import { CreateRentalOrderDto, RentalOrderDto, UpdateRentalOrderDto } from '../dto';
import { RentalOrderStatus } from '../enums';
import { RentalOrderItem } from './rental-order-item.entity';
import { RentalOrderPeriod } from './rental-order-period.entity';

@Entity()
export class RentalOrder implements Authorizable {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  sectionId: number;

  @Column({ nullable: true })
  warehouseId: number | null;

  @Column()
  entityId: number;

  @Column()
  createdBy: number;

  @Column()
  currency: Currency;

  @Column()
  taxIncluded: boolean;

  @Column()
  status: RentalOrderStatus;

  @Column()
  orderNumber: number;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  private _periods: RentalOrderPeriod[] = [];
  private _items: RentalOrderItem[] = [];
  private _entityInfo: EntityInfoDto = null;

  constructor(
    accountId: number,
    sectionId: number,
    warehouseId: number | null,
    createdBy: number,
    currency: Currency,
    taxIncluded: boolean,
    entityId: number,
    status: RentalOrderStatus,
    orderNumber: number,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.sectionId = sectionId;
    this.warehouseId = warehouseId;
    this.entityId = entityId;
    this.createdBy = createdBy;
    this.currency = currency;
    this.taxIncluded = taxIncluded;
    this.status = status;
    this.orderNumber = orderNumber;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public get periods(): RentalOrderPeriod[] {
    return this._periods;
  }
  public set periods(periods: RentalOrderPeriod[]) {
    this._periods = periods;
  }

  public get items(): RentalOrderItem[] {
    return this._items;
  }
  public set items(items: RentalOrderItem[]) {
    this._items = items;
  }

  public get entityInfo(): EntityInfoDto {
    return this._entityInfo;
  }
  public set entityInfo(value: EntityInfoDto) {
    this._entityInfo = value;
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
    dto: CreateRentalOrderDto,
  ): RentalOrder {
    return new RentalOrder(
      accountId,
      sectionId,
      dto.warehouseId,
      createdBy,
      dto.currency,
      dto.taxIncluded,
      dto.entityId,
      dto.status,
      orderNumber,
    );
  }

  public toDto(): RentalOrderDto {
    return new RentalOrderDto(
      this.id,
      this.sectionId,
      this.warehouseId,
      this.orderNumber,
      this.createdBy,
      this.currency,
      this.taxIncluded,
      this.status,
      this.createdAt.toISOString(),
      this._periods?.map((period) => period.toDto()) ?? [],
      this._items?.map((item) => item.toDto()) ?? [],
      this._entityInfo,
    );
  }

  public update(dto: UpdateRentalOrderDto): RentalOrder {
    this.warehouseId = dto.warehouseId;
    this.status = dto.status;
    this.currency = dto.currency;
    this.taxIncluded = dto.taxIncluded;

    return this;
  }
}
