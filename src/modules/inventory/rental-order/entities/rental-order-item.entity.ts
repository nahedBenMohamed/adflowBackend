import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { CreateRentalOrderItemDto, RentalOrderItemDto } from '../dto';

@Entity()
export class RentalOrderItem {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  orderId: number;

  @Column()
  productId: number;

  @Column({
    type: 'numeric',
    transformer: {
      to: (value: number) => value,
      from: (value: unknown) => Number(value),
    },
  })
  unitPrice: number;

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
  sortOrder: number;

  @Column()
  accountId: number;

  constructor(
    accountId: number,
    orderId: number,
    productId: number,
    unitPrice: number,
    tax: number,
    discount: number,
    sortOrder: number,
    id?: number,
  ) {
    this.id = id;
    this.accountId = accountId;
    this.orderId = orderId;
    this.productId = productId;
    this.unitPrice = unitPrice;
    this.tax = tax;
    this.discount = discount;
    this.sortOrder = sortOrder;
  }

  public static fromDto(
    accountId: number,
    orderId: number,
    dto: CreateRentalOrderItemDto,
    id?: number,
  ): RentalOrderItem {
    return new RentalOrderItem(
      accountId,
      orderId,
      dto.productId,
      dto.unitPrice,
      dto.tax,
      dto.discount,
      dto.sortOrder,
      id,
    );
  }

  public toDto(): RentalOrderItemDto {
    return new RentalOrderItemDto(this.id, this.productId, this.unitPrice, this.tax, this.discount, this.sortOrder);
  }
}
