import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class MailboxSignatureMailbox {
  @PrimaryColumn()
  signatureId: number;

  @PrimaryColumn()
  mailboxId: number;

  @Column()
  accountId: number;

  constructor(accountId: number, signatureId: number, mailboxId: number) {
    this.mailboxId = mailboxId;
    this.signatureId = signatureId;
    this.accountId = accountId;
  }
}
