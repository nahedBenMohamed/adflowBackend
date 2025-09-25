import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Reservation } from '../../reservation/entities/reservation.entity';
import { Product } from '../../product/entities/product.entity';

import { OrderItemDto } from '../dto/order-item.dto';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({
    type: 'numeric',
    transformer: {
      to: (value: number) => value,
      from: (value: unknown) => Number(value),
    },
  })
  unitPrice: number;

  @Column()
  quantity: number;

  @Column({
    type: 'numeric',
    transformer: {
      to: (value: number) => value,
      from: (value: unknown) => Number(value),
    },
  })
  tax: number;

  @Column({
    type: 'numeric',
    transformer: {
      to: (value: number) => value,
      from: (value: unknown) => Number(value),
    },
  })
  discount: number;

  @Column()
  productId: number;

  @Column()
  orderId: number;

  @Column()
  sortOrder: number;

  @Column()
  accountId: number;

  private _product: Product;
  private _reservations: Reservation[];

  constructor(
    accountId: number,
    unitPrice: number,
    quantity: number,
    tax: number,
    discount: number,
    productId: number,
    orderId: number,
    sortOrder: number,
  ) {
    this.accountId = accountId;
    this.unitPrice = unitPrice;
    this.quantity = quantity;
    this.tax = tax;
    this.discount = discount;
    this.productId = productId;
    this.orderId = orderId;
    this.sortOrder = sortOrder;
  }

  public get product(): Product {
    return this._product;
  }
  public set product(value: Product) {
    this._product = value;
  }

  public get reservations(): Reservation[] {
    return this._reservations;
  }
  public set reservations(value: Reservation[]) {
    this._reservations = value;
  }

  public static fromDto(accountId: number, orderId: number, dto: OrderItemDto): OrderItem {
    return new OrderItem(
      accountId,
      dto.unitPrice,
      dto.quantity,
      dto.tax,
      dto.discount,
      dto.productId,
      orderId,
      dto.sortOrder,
    );
  }

  public update(dto: OrderItemDto): OrderItem {
    this.unitPrice = dto.unitPrice !== undefined ? dto.unitPrice : this.unitPrice;
    this.quantity = dto.quantity !== undefined ? dto.quantity : this.quantity;
    this.tax = dto.tax !== undefined ? dto.tax : this.tax;
    this.discount = dto.discount !== undefined ? dto.discount : this.discount;
    this.productId = dto.productId !== undefined ? dto.productId : this.productId;
    this.sortOrder = dto.sortOrder !== undefined ? dto.sortOrder : this.sortOrder;

    return this;
  }

  public toDto(): OrderItemDto {
    return new OrderItemDto(
      this.id,
      this.unitPrice,
      this.quantity,
      this.tax,
      this.discount,
      this.productId,
      this.sortOrder,
      this._product ? this._product.toInfo() : undefined,
      this._reservations ? this._reservations.map((r) => r.toDto()) : undefined,
    );
  }
}
