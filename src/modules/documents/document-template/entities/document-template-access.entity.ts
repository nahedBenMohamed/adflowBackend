import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class DocumentTemplateAccess {
  @PrimaryColumn()
  documentTemplateId: number;

  @PrimaryColumn()
  userId: number;

  @Column()
  accountId: number;

  constructor(accountId: number, documentTemplateId: number, userId: number) {
    this.accountId = accountId;
    this.documentTemplateId = documentTemplateId;
    this.userId = userId;
  }
}
