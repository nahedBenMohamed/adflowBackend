import { FieldType } from '../../enums';

export class FieldEvent {
  accountId: number;
  entityTypeId: number;
  fieldId: number;
  type?: FieldType;

  constructor({ accountId, entityTypeId, fieldId, type }: FieldEvent) {
    this.accountId = accountId;
    this.entityTypeId = entityTypeId;
    this.fieldId = fieldId;
    this.type = type;
  }
}
