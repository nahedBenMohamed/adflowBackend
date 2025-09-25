import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Currency } from '@/common';

import { CreateProductPriceDto, UpdateProductPriceDto, ProductPriceDto } from '../dto';

@Entity()
export class ProductPrice {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  name: string | null;

  @Column({
    type: 'numeric',
    transformer: {
      to: (value: number) => value,
      from: (value: unknown) => Number(value),
    },
  })
  unitPrice: number;

  @Column()
  currency: Currency;

  @Column({ nullable: true })
  maxDiscount: number | null;

  @Column()
  productId: number;

  @Column()
  accountId: number;

  constructor(
    accountId: number,
    name: string | null,
    unitPrice: number,
    currency: Currency,
    maxDiscount: number | null,
    productId: number,
  ) {
    this.accountId = accountId;
    this.name = name;
    this.unitPrice = unitPrice;
    this.currency = currency;
    this.maxDiscount = maxDiscount;
    this.productId = productId;
  }

  public static fromDto(accountId: number, productId: number, dto: CreateProductPriceDto): ProductPrice {
    dto.unitPrice = parseFloat(dto.unitPrice.toFixed(2));

    return new ProductPrice(accountId, dto.name, dto.unitPrice, dto.currency, dto.maxDiscount, productId);
  }

  public update(dto: UpdateProductPriceDto): ProductPrice {
    this.name = dto.name;
    this.currency = dto.currency;
    this.maxDiscount = dto.maxDiscount;
    this.unitPrice = parseFloat(dto.unitPrice.toFixed(2));

    return this;
  }

  public toDto(): ProductPriceDto {
    return new ProductPriceDto(this.id, this.name, this.unitPrice, this.currency, this.maxDiscount);
  }
}
