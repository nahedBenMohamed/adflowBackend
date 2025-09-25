import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';
import { Authorizable, AuthorizableObject, SimpleAuthorizable } from '@/modules/iam/common';

import { PermissionObjectType } from '../../common';

import { CreateProductCategoryDto } from '../dto/create-product-category.dto';
import { ProductCategoryDto } from '../dto/product-category.dto';

@Entity()
export class ProductCategory implements Authorizable {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  sectionId: number;

  @Column()
  name: string;

  @Column()
  parentId: number | null;

  @Column()
  createdBy: number;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  private _children: ProductCategory[] | null;

  constructor(
    accountId: number,
    sectionId: number,
    name: string,
    parentId: number | null,
    createdBy: number,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.sectionId = sectionId;
    this.name = name;
    this.parentId = parentId;
    this.createdBy = createdBy;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public set children(children: ProductCategory[] | null) {
    this._children = children;
  }
  public get children(): ProductCategory[] | null {
    return this._children;
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

  public static fromDto(accountId: number, sectionId: number, createdBy: number, dto: CreateProductCategoryDto) {
    return new ProductCategory(accountId, sectionId, dto.name, dto.parentId, createdBy);
  }

  public toDto(): ProductCategoryDto {
    return new ProductCategoryDto(
      this.id,
      this.sectionId,
      this.name,
      this.parentId,
      this._children?.map((child) => child.toDto()) ?? [],
    );
  }
}
