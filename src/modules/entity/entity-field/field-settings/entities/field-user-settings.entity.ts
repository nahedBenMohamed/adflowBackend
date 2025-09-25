import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { FieldAccess } from '../enums';

@Entity()
export class FieldUserSettings {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  fieldId: number;

  @Column()
  userId: number;

  @Column()
  access: FieldAccess;

  constructor(accountId: number, fieldId: number, userId: number, access: FieldAccess) {
    this.accountId = accountId;
    this.fieldId = fieldId;
    this.userId = userId;
    this.access = access;
  }
}
