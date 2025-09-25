import { MailMessageEvent } from './mail-message.event';

export class MailMessageReceivedEvent extends MailMessageEvent {
  isInbox: boolean;
  ownerId: number;
  messageSubject: string;
  messageSnippet: string;

  constructor({
    accountId,
    ownerId,
    entityId,
    messageId,
    messageSubject,
    messageSnippet,
    messageDate,
    isInbox,
  }: MailMessageReceivedEvent) {
    super({ accountId, entityId, messageId, messageDate });

    this.ownerId = ownerId;
    this.messageSubject = messageSubject;
    this.messageSnippet = messageSnippet;
    this.isInbox = isInbox;
  }
}
