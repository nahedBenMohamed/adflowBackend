import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { Authorizable, AuthorizableObject, SimpleAuthorizable } from '@/modules/iam/common';

import { EntityCategory, PermissionObjectType } from '../../common';
import { SectionView } from '../enums';

@Entity()
export class EntityType implements Authorizable {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  name: string;

  @Column()
  entityCategory: EntityCategory;

  @Column()
  sectionName: string;

  @Column()
  sectionView: SectionView;

  @Column()
  sectionIcon: string;

  @Column()
  sortOrder: number;

  @Column()
  createdAt: Date;

  constructor(
    accountId: number,
    name: string,
    entityCategory: EntityCategory,
    sectionName: string,
    sectionView: SectionView,
    sectionIcon: string,
    sortOrder: number,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.name = name;
    this.entityCategory = entityCategory;
    this.sectionName = sectionName;
    this.sectionView = sectionView;
    this.sectionIcon = sectionIcon;
    this.sortOrder = sortOrder;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  hasBoardSectionView(): boolean {
    return this.sectionView === SectionView.BOARD;
  }

  getAuthorizableObject(): AuthorizableObject {
    return { type: PermissionObjectType.EntityType, id: this.id };
  }
  static getAuthorizable(entityTypeId: number): Authorizable {
    return new SimpleAuthorizable({ type: PermissionObjectType.EntityType, id: entityTypeId });
  }

  public isProject() {
    return this.entityCategory === EntityCategory.PROJECT;
  }

  public static copy(accountId: number, et: EntityType): EntityType {
    return new EntityType(
      accountId,
      et.name,
      et.entityCategory,
      et.sectionName,
      et.sectionView,
      et.sectionIcon,
      et.sortOrder,
    );
  }
}
