import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class MailboxAccessibleUser {
  @PrimaryColumn()
  mailboxId: number;

  @PrimaryColumn()
  userId: number;

  @Column()
  accountId: number;

  constructor(accountId: number, mailboxId: number, userId: number) {
    this.mailboxId = mailboxId;
    this.userId = userId;
    this.accountId = accountId;
  }
}
