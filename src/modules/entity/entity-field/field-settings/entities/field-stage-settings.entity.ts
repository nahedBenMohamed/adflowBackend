import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { FieldAccess } from '../enums';

@Entity()
export class FieldStageSettings {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  fieldId: number;

  @Column()
  stageId: number;

  @Column()
  access: FieldAccess;

  @Column('integer', { array: true, nullable: true })
  excludeUserIds: number[] | null;

  constructor(
    accountId: number,
    fieldId: number,
    stageId: number,
    access: FieldAccess,
    excludeUserIds: number[] | null,
  ) {
    this.accountId = accountId;
    this.fieldId = fieldId;
    this.stageId = stageId;
    this.access = access;
    this.excludeUserIds = excludeUserIds;
  }
}
