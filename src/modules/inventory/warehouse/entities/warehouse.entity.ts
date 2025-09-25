import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';
import { Authorizable, AuthorizableObject, SimpleAuthorizable, UserRights } from '@/modules/iam/common';

import { PermissionObjectType } from '../../common';
import { CreateWarehouseDto, UpdateWarehouseDto, WarehouseDto } from '../dto';

@Entity()
export class Warehouse implements Authorizable {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  sectionId: number;

  @Column()
  name: string;

  @Column()
  createdBy: number;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(accountId: number, sectionId: number, name: string, createdBy: number, createdAt?: Date) {
    this.accountId = accountId;
    this.sectionId = sectionId;
    this.name = name;
    this.createdBy = createdBy;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  private _userRights: UserRights | null;
  public get userRights(): UserRights {
    return this._userRights ?? UserRights.full();
  }
  public set userRights(value: UserRights | null) {
    this._userRights = value;
  }

  static getAuthorizable(warehouseId: number): Authorizable {
    return new SimpleAuthorizable({ type: PermissionObjectType.Warehouse, id: warehouseId });
  }
  getAuthorizableObject(): AuthorizableObject {
    return {
      type: PermissionObjectType.Warehouse,
      id: this.id,
      createdBy: this.createdBy,
    };
  }

  public static fromDto({
    accountId,
    sectionId,
    createdBy,
    dto,
  }: {
    accountId: number;
    sectionId: number;
    createdBy: number;
    dto: CreateWarehouseDto;
  }): Warehouse {
    return new Warehouse(accountId, sectionId, dto.name, createdBy);
  }

  public update(dto: UpdateWarehouseDto): Warehouse {
    this.name = dto.name !== undefined ? dto.name : this.name;

    return this;
  }

  public toDto(): WarehouseDto {
    return {
      id: this.id,
      sectionId: this.sectionId,
      name: this.name,
      userRights: this.userRights,
    };
  }
}
