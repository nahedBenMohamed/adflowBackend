import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class DocumentTemplateEntityType {
  @PrimaryColumn()
  documentTemplateId: number;

  @PrimaryColumn()
  entityTypeId: number;

  @Column()
  accountId: number;

  constructor(accountId: number, documentTemplateId: number, entityTypeId: number) {
    this.accountId = accountId;
    this.documentTemplateId = documentTemplateId;
    this.entityTypeId = entityTypeId;
  }
}
