export class MailboxEvent {
  accountId: number;
  mailboxId: number;

  constructor({ accountId, mailboxId }: MailboxEvent) {
    this.accountId = accountId;
    this.mailboxId = mailboxId;
  }
}
