import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { CreateTutorialItemDto, UpdateTutorialItemDto, TutorialItemDto } from '../dto';
import { TutorialItemUser } from './tutorial-item-user.entity';
import { TutorialItemProduct } from './tutorial-item-product.entity';

@Entity()
export class TutorialItem {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  groupId: number;

  @Column()
  name: string;

  @Column()
  link: string;

  @Column()
  sortOrder: number;

  @Column()
  createdAt: Date;

  constructor(accountId: number, groupId: number, name: string, link: string, sortOrder: number, createdAt?: Date) {
    this.accountId = accountId;
    this.groupId = groupId;
    this.name = name;
    this.link = link;
    this.sortOrder = sortOrder;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  private _users: TutorialItemUser[] | null = null;
  public get users(): TutorialItemUser[] | null {
    return this._users;
  }
  public set users(value: TutorialItemUser[] | null) {
    this._users = value;
  }

  private _products: TutorialItemProduct[] | null = null;
  public get products(): TutorialItemProduct[] | null {
    return this._products;
  }
  public set products(value: TutorialItemProduct[] | null) {
    this._products = value;
  }

  public static fromDto(accountId: number, groupId: number, dto: CreateTutorialItemDto): TutorialItem {
    return new TutorialItem(accountId, groupId, dto.name, dto.link, dto.sortOrder);
  }

  public update(dto: UpdateTutorialItemDto): TutorialItem {
    this.name = dto.name ?? this.name;
    this.link = dto.link ?? this.link;
    this.sortOrder = dto.sortOrder ?? this.sortOrder;

    return this;
  }

  public toDto(): TutorialItemDto {
    return new TutorialItemDto({
      id: this.id,
      groupId: this.groupId,
      name: this.name,
      link: this.link,
      sortOrder: this.sortOrder,
      createdAt: this.createdAt.toISOString(),
      userIds: this.users?.length ? this.users.map((user) => user.userId) : null,
      products: this.products?.length ? this.products.map((product) => product.toDto()) : null,
    });
  }
}
