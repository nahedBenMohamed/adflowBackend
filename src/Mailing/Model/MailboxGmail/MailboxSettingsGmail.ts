import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Auth } from 'googleapis';

@Entity()
export class MailboxSettingsGmail {
  @PrimaryColumn()
  mailboxId: number;

  @Column({ type: 'jsonb' })
  tokens: Auth.Credentials;

  @Column()
  historyId: string | null;

  @Column()
  accountId: number;

  constructor(mailboxId: number, accountId: number, tokens: Auth.Credentials, historyId: string | null = null) {
    this.mailboxId = mailboxId;
    this.accountId = accountId;
    this.tokens = tokens;
    this.historyId = historyId;
  }
}
