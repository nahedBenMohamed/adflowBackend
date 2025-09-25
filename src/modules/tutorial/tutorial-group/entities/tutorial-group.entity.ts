import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { TutorialItem } from '../../tutorial-item';
import { CreateTutorialGroupDto, UpdateTutorialGroupDto, TutorialGroupDto } from '../dto';

@Entity()
export class TutorialGroup {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  name: string;

  @Column()
  sortOrder: number;

  @Column()
  createdAt: Date;

  constructor(accountId: number, name: string, sortOrder: number, createdAt?: Date) {
    this.accountId = accountId;
    this.name = name;
    this.sortOrder = sortOrder;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  private _items: TutorialItem[] | null = null;
  public get items(): TutorialItem[] | null {
    return this._items;
  }
  public set items(value: TutorialItem[] | null) {
    this._items = value;
  }

  public static fromDto(accountId: number, dto: CreateTutorialGroupDto): TutorialGroup {
    return new TutorialGroup(accountId, dto.name, dto.sortOrder);
  }

  public update(dto: UpdateTutorialGroupDto): TutorialGroup {
    this.name = dto.name ?? this.name;
    this.sortOrder = dto.sortOrder ?? this.sortOrder;

    return this;
  }

  public toDto(): TutorialGroupDto {
    return new TutorialGroupDto({
      id: this.id,
      name: this.name,
      sortOrder: this.sortOrder,
      createdAt: this.createdAt.toISOString(),
      items: this.items?.map((item) => item.toDto()) ?? null,
    });
  }
}
