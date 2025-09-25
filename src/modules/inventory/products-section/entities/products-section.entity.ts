import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';
import { Authorizable, AuthorizableObject, SimpleAuthorizable } from '@/modules/iam/common';

import { PermissionObjectType } from '../../common';
import { CreateProductsSectionDto, ProductsSectionDto, UpdateProductsSectionDto } from '../dto';
import { ProductsSectionType } from '../enums';
import { ProductsSectionEntityType } from './products-section-entity-type.entity';

@Entity()
export class ProductsSection implements Authorizable {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column({ default: 'sale' })
  type: ProductsSectionType;

  @Column()
  enableWarehouse: boolean;

  @Column({ default: true })
  enableBarcode: boolean;

  @Column({ nullable: true })
  cancelAfter: number | null;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  private _links: ProductsSectionEntityType[] = [];
  private _schedulerIds: number[] | null;

  constructor(
    accountId: number,
    name: string,
    icon: string,
    type: ProductsSectionType,
    enableWarehouse: boolean,
    enableBarcode: boolean,
    cancelAfter: number | null,
    createdAt?: Date,
  ) {
    this.name = name;
    this.icon = icon;
    this.type = type;
    this.enableWarehouse = enableWarehouse;
    this.enableBarcode = enableBarcode;
    this.accountId = accountId;
    this.cancelAfter = cancelAfter;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public get links(): ProductsSectionEntityType[] {
    return this._links;
  }
  public set links(value: ProductsSectionEntityType[]) {
    this._links = value;
  }

  public get schedulerIds(): number[] | null {
    return this._schedulerIds;
  }
  public set schedulerIds(value: number[] | null) {
    this._schedulerIds = value;
  }

  static getAuthorizable(sectionId: number): Authorizable {
    return new SimpleAuthorizable({ type: PermissionObjectType.Products, id: sectionId });
  }
  getAuthorizableObject(): AuthorizableObject {
    return {
      type: PermissionObjectType.Products,
      id: this.id,
    };
  }

  public static fromDto(accountId: number, dto: CreateProductsSectionDto): ProductsSection {
    return new ProductsSection(
      accountId,
      dto.name,
      dto.icon,
      dto.type ?? ProductsSectionType.Sale,
      dto.enableWarehouse ?? true,
      dto.enableBarcode ?? true,
      dto.cancelAfter,
    );
  }

  public toDto(): ProductsSectionDto {
    return new ProductsSectionDto({
      id: this.id,
      name: this.name,
      icon: this.icon,
      type: this.type,
      enableWarehouse: this.enableWarehouse,
      enableBarcode: this.enableBarcode,
      cancelAfter: this.cancelAfter,
      entityTypeIds: this._links.map((l) => l.entityTypeId),
      schedulerIds: this.schedulerIds ?? null,
    });
  }

  public update(dto: UpdateProductsSectionDto): ProductsSection {
    this.name = dto.name;
    this.icon = dto.icon;
    this.enableWarehouse = dto.enableWarehouse ?? true;
    this.enableBarcode = dto.enableBarcode ?? true;
    this.cancelAfter = dto.cancelAfter !== undefined ? dto.cancelAfter : this.cancelAfter;

    return this;
  }
}
