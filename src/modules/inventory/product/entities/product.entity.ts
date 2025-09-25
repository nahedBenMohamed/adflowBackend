import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { Authorizable, AuthorizableObject, SimpleAuthorizable } from '@/modules/iam/common';
import { FileLinkDto } from '@/CRM/Service/FileLink/FileLinkDto';

import { PermissionObjectType } from '../../common';

import { ProductPrice } from '../../product-price/entities/product-price.entity';
import { ProductStock } from '../../product-stock/entities';
import { RentalScheduleStatus } from '../../rental-schedule/enums';
import { RentalEvent } from '../../rental-schedule/entities/rental-event.entity';
import { ProductType } from '../enums/product-type.enum';
import { ProductDto } from '../dto/product.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductInfoDto } from '../dto/product-info.dto';

@Entity()
export class Product implements Authorizable {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  sectionId: number;

  @Column()
  name: string;

  @Column()
  type: ProductType;

  @Column()
  description: string | null;

  @Column()
  sku: string | null;

  @Column()
  unit: string | null;

  @Column()
  tax: number | null;

  @Column()
  isDeleted: boolean;

  @Column()
  categoryId: number | null;

  @Column()
  createdBy: number;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  constructor(
    accountId: number,
    sectionId: number,
    name: string,
    type: ProductType,
    description: string | null,
    sku: string | null,
    unit: string | null,
    tax: number | null,
    isDeleted: boolean,
    categoryId: number | null,
    createdBy: number,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.sectionId = sectionId;
    this.name = name;
    this.type = type;
    this.description = description;
    this.sku = sku;
    this.unit = unit;
    this.tax = tax;
    this.isDeleted = isDeleted;
    this.categoryId = categoryId;
    this.createdBy = createdBy;
    this.createdAt = createdAt ?? DateUtil.now();
    this.updatedAt = this.createdAt;
  }

  static getAuthorizable(sectionId: number): Authorizable {
    return new SimpleAuthorizable({ type: PermissionObjectType.Products, id: sectionId });
  }
  getAuthorizableObject(): AuthorizableObject {
    return {
      type: PermissionObjectType.Products,
      id: this.sectionId,
      createdBy: this.createdBy,
    };
  }

  public static fromDto(accountId: number, sectionId: number, createdBy: number, dto: CreateProductDto): Product {
    return new Product(
      accountId,
      sectionId,
      dto.name,
      dto.type,
      dto.description,
      dto.sku,
      dto.unit,
      dto.tax,
      false,
      dto.categoryId,
      createdBy,
    );
  }

  public toDto(
    prices: ProductPrice[] | null,
    photoFileLinks: FileLinkDto[],
    stocks: ProductStock[] | null,
    rentalStatus: RentalScheduleStatus | null = null,
    rentalEvents: RentalEvent[] | null = null,
  ): ProductDto {
    return new ProductDto(
      this.id,
      this.sectionId,
      this.name,
      this.type,
      this.description,
      this.sku,
      this.unit,
      this.tax,
      this.categoryId,
      this.updatedAt.toISOString(),
      prices ? prices.map((price) => price.toDto()) : [],
      photoFileLinks,
      stocks ? stocks.map((stock) => stock.toDto()) : [],
      rentalStatus,
      rentalEvents ? rentalEvents.map((event) => event.toDto()) : [],
    );
  }

  public toInfo(): ProductInfoDto {
    return new ProductInfoDto(this.id, this.name);
  }
}
