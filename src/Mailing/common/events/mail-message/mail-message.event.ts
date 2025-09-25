export class MailMessageEvent {
  accountId: number;
  entityId: number | null;
  messageId: number;
  messageDate: string;

  constructor({ accountId, entityId, messageId, messageDate }: MailMessageEvent) {
    this.accountId = accountId;
    this.entityId = entityId;
    this.messageId = messageId;
    this.messageDate = messageDate;
  }
}
