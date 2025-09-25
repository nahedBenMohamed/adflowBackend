import { Column, Entity, PrimaryColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { FieldType } from '../../common';
import { FieldOption } from '../../field-option';

import { FieldCode, FieldFormat } from '../enums';
import { CreateFieldDto, FieldDto, UpdateFieldDto } from '../dto';

@Entity()
export class Field {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: FieldType;

  @Column({ nullable: true })
  code: FieldCode | null;

  @Column()
  active: boolean;

  @Column()
  sortOrder: number;

  @Column()
  entityTypeId: number;

  @Column({ nullable: true })
  fieldGroupId: number | null;

  @Column({ nullable: true })
  value: string | null;

  @Column({ nullable: true })
  format: FieldFormat | null;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  _options: FieldOption[] | null = null;

  constructor(
    accountId: number,
    id: number,
    name: string,
    type: FieldType,
    code: FieldCode | null,
    active: boolean,
    sortOrder: number,
    entityTypeId: number,
    fieldGroupId: number | null,
    value: string | null,
    format: FieldFormat | null,
  ) {
    this.accountId = accountId;
    this.id = id;
    this.name = name;
    this.type = type;
    this.code = code;
    this.active = active;
    this.sortOrder = sortOrder;
    this.entityTypeId = entityTypeId;
    this.fieldGroupId = fieldGroupId;
    this.value = value;
    this.format = format;
    this.createdAt = DateUtil.now();
  }

  public get options(): FieldOption[] | null {
    return this._options;
  }
  public set options(value: FieldOption[] | null) {
    this._options = value;
  }

  public static fromDto(accountId: number, entityTypeId: number, dto: CreateFieldDto): Field {
    return new Field(
      accountId,
      dto.id,
      dto.name,
      dto.type,
      dto.code,
      dto.active ?? true,
      dto.sortOrder,
      entityTypeId,
      dto.fieldGroupId,
      dto.value,
      dto.format,
    );
  }

  public toDto(): FieldDto {
    const options = this._options ? this._options.map((option) => option.toDto()) : [];

    return new FieldDto({ ...this, options });
  }

  public update(dto: UpdateFieldDto): Field {
    this.name = dto.name !== undefined ? dto.name : this.name;
    this.type = dto.type !== undefined ? dto.type : this.type;
    this.code = dto.code !== undefined ? dto.code : this.code;
    this.active = dto.active !== undefined ? dto.active : this.active;
    this.sortOrder = dto.sortOrder !== undefined ? dto.sortOrder : this.sortOrder;
    this.fieldGroupId = dto.fieldGroupId !== undefined ? dto.fieldGroupId : this.fieldGroupId;
    this.value = dto.value !== undefined ? dto.value : this.value;
    this.format = dto.format !== undefined ? dto.format : this.format;

    return this;
  }
}
