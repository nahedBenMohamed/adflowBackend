import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { FieldType } from '../../common';
import { CreateFieldValueDto, FieldValueDto } from '../dto';
import {
  FieldPayloadValue,
  FieldPayloadValues,
  FieldPayloadOption,
  FieldPayloadOptions,
  FieldPayloadParticipants,
  FieldPayloadChecklistItem,
} from '../types';

type PayloadType =
  | FieldPayloadValue<string>
  | FieldPayloadValue<number>
  | FieldPayloadValue<boolean>
  | FieldPayloadValue<string[]>
  | FieldPayloadValues<string>
  | FieldPayloadOption
  | FieldPayloadOptions
  | FieldPayloadParticipants
  | FieldPayloadValue<FieldPayloadChecklistItem[]>;

@Entity()
export class FieldValue {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  fieldId: number;

  @Column()
  fieldType: FieldType;

  @Column({ type: 'jsonb' })
  payload: PayloadType;

  @Column()
  entityId: number;

  @Column()
  accountId: number;

  constructor(accountId: number, fieldId: number, fieldType: FieldType, payload: PayloadType, entityId: number) {
    this.accountId = accountId;
    this.fieldId = fieldId;
    this.fieldType = fieldType;
    this.payload = payload;
    this.entityId = entityId;
  }

  static fromDto(accountId: number, entityId: number, dto: CreateFieldValueDto): FieldValue {
    return new FieldValue(accountId, dto.fieldId, dto.fieldType, dto.payload, entityId);
  }

  toDto(): FieldValueDto {
    return new FieldValueDto({ ...this });
  }

  getValue<T>(): T | null {
    switch (this.fieldType) {
      case FieldType.Text:
      case FieldType.RichText:
      case FieldType.Link:
      case FieldType.Number:
      case FieldType.Value:
      case FieldType.Formula:
      case FieldType.Switch:
      case FieldType.Date:
      case FieldType.Participant:
      case FieldType.File:
        return (this.payload as FieldPayloadValue<T>).value;
      case FieldType.MultiText:
      case FieldType.Phone:
      case FieldType.Email:
        return (this.payload as FieldPayloadValues<string>).values as T;
      case FieldType.Select:
      case FieldType.ColoredSelect:
        return (this.payload as FieldPayloadOption).optionId as T;
      case FieldType.MultiSelect:
      case FieldType.ColoredMultiSelect:
      case FieldType.CheckedMultiSelect:
        return (this.payload as FieldPayloadOptions).optionIds as T;
      case FieldType.Participants:
        return (this.payload as FieldPayloadParticipants).userIds as T;
      case FieldType.Checklist:
        return (this.payload as FieldPayloadValue<FieldPayloadChecklistItem[]>).value as T;
    }
  }
}
