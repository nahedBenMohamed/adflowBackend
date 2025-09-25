import { Column, Entity, PrimaryColumn } from 'typeorm';

import { ProductStockDto } from '../dto';

@Entity()
export class ProductStock {
  @PrimaryColumn()
  productId: number;

  @PrimaryColumn()
  warehouseId: number;

  @Column({
    type: 'numeric',
    transformer: {
      to: (value: number) => value,
      from: (value: unknown) => Number(value),
    },
  })
  stockQuantity: number;

  @Column()
  accountId: number;

  constructor(accountId: number, productId: number, warehouseId: number, stockQuantity: number) {
    this.accountId = accountId;
    this.productId = productId;
    this.warehouseId = warehouseId;
    this.stockQuantity = stockQuantity;
  }

  private _reserved: number | null;
  public get reserved(): number {
    return this._reserved ?? 0;
  }
  public set reserved(value: number) {
    this._reserved = value;
  }

  public toDto(): ProductStockDto {
    return {
      warehouseId: this.warehouseId,
      stockQuantity: this.stockQuantity,
      reserved: this.reserved,
      available: this.stockQuantity - this.reserved,
    };
  }
}
