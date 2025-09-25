import { Column, Entity, PrimaryColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { CreateFieldOptionDto, FieldOptionDto, UpdateFieldOptionDto } from '../dto';

@Entity()
export class FieldOption {
  @PrimaryColumn()
  id: number;

  @Column()
  label: string;

  @Column()
  color: string | null;

  @Column()
  sortOrder: number;

  @Column()
  fieldId: number;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(
    accountId: number,
    id: number,
    label: string,
    color: string | null,
    sortOrder: number,
    fieldId: number,
    createdAt?: Date,
  ) {
    this.id = id;
    this.label = label;
    this.color = color;
    this.sortOrder = sortOrder;
    this.fieldId = fieldId;
    this.accountId = accountId;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public static fromDto(accountId: number, fieldId: number, dto: CreateFieldOptionDto): FieldOption {
    return new FieldOption(accountId, dto.id, dto.label, dto.color, dto.sortOrder, fieldId);
  }

  public toDto(): FieldOptionDto {
    return new FieldOptionDto({ ...this });
  }

  public update(dto: UpdateFieldOptionDto): FieldOption {
    this.label = dto.label !== undefined ? dto.label : this.label;
    this.color = dto.color !== undefined ? dto.color : this.color;
    this.sortOrder = dto.sortOrder !== undefined ? dto.sortOrder : this.sortOrder;

    return this;
  }
}
