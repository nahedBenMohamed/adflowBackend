import { Column, Entity, PrimaryColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { FieldGroupCode } from '../enums';
import { CreateFieldGroupDto, FieldGroupDto, UpdateFieldGroupDto } from '../dto';

@Entity()
export class FieldGroup {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  sortOrder: number;

  @Column()
  entityTypeId: number;

  @Column({ nullable: true })
  code: FieldGroupCode | null;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(
    accountId: number,
    id: number,
    name: string,
    sortOrder: number,
    entityTypeId: number,
    code: FieldGroupCode | null,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.id = id;
    this.name = name;
    this.sortOrder = sortOrder;
    this.entityTypeId = entityTypeId;
    this.code = code;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public static fromDto(accountId: number, entityTypeId: number, dto: CreateFieldGroupDto): FieldGroup {
    return new FieldGroup(accountId, dto.id, dto.name, dto.sortOrder, entityTypeId, dto.code);
  }

  public update(dto: UpdateFieldGroupDto): FieldGroup {
    this.name = dto.name !== undefined ? dto.name : this.name;
    this.sortOrder = dto.sortOrder !== undefined ? dto.sortOrder : this.sortOrder;
    this.code = dto.code !== undefined ? dto.code : this.code;

    return this;
  }

  public toDto(): FieldGroupDto {
    return {
      id: this.id,
      name: this.name,
      sortOrder: this.sortOrder,
      entityTypeId: this.entityTypeId,
      code: this.code,
    };
  }
}
