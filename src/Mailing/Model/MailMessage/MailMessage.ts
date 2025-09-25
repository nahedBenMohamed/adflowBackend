import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { MailMessageExternal } from '../../common';

@Entity()
export class MailMessage {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  mailboxId: number;

  @Column()
  externalId: string;

  @Column()
  threadId: string;

  @Column({ nullable: true })
  snippet: string | null;

  @Column({ nullable: true })
  sentFrom: string | null;

  @Column({ nullable: true })
  sentTo: string | null;

  @Column({ nullable: true })
  replyTo: string | null;

  @Column({ nullable: true })
  cc: string | null;

  @Column({ nullable: true })
  subject: string | null;

  @Column()
  date: Date;

  @Column()
  hasAttachment: boolean;

  @Column({ nullable: true })
  messageId: string | null;

  @Column('simple-array', { nullable: true })
  referencesTo: string[] | null;

  @Column({ nullable: true })
  inReplyTo: string | null;

  @Column({ nullable: true })
  entityId: number | null;

  @Column()
  isSeen: boolean;

  @Column()
  accountId: number;

  constructor(
    accountId: number,
    mailboxId: number,
    externalId: string,
    threadId: string,
    snippet: string | null,
    sentFrom: string | null,
    sentTo: string | null,
    replyTo: string | null,
    cc: string | null,
    subject: string | null,
    date: Date,
    hasAttachment: boolean,
    messageId: string | null,
    referencesTo: string[] | null,
    inReplyTo: string | null,
    entityId: number | null,
    isSeen: boolean,
  ) {
    this.accountId = accountId;
    this.mailboxId = mailboxId;
    this.externalId = externalId;
    this.threadId = threadId;
    this.snippet = snippet;
    this.sentFrom = sentFrom;
    this.sentTo = sentTo;
    this.replyTo = replyTo;
    this.cc = cc;
    this.subject = subject;
    this.date = date;
    this.hasAttachment = hasAttachment;
    this.messageId = messageId;
    this.referencesTo = referencesTo;
    this.inReplyTo = inReplyTo;
    this.entityId = entityId;
    this.isSeen = isSeen;
  }

  public static create(accountId: number, mailboxId: number, entityId: number | null, message: MailMessageExternal) {
    return new MailMessage(
      accountId,
      mailboxId,
      message.id,
      message.threadId,
      message.snippet,
      message.sentFrom?.text ?? null,
      message.sentTo?.text ?? null,
      message.replyTo?.text ?? null,
      message.cc?.text ?? null,
      message.subject,
      message.date,
      message.hasAttachment,
      message.messageId,
      message.references,
      message.inReplyTo,
      entityId,
      message.isSeen,
    );
  }

  public update(message: MailMessageExternal): MailMessage {
    this.externalId = message.id;
    if (message.threadId) {
      this.threadId = message.threadId;
    }
    this.snippet = message.snippet;
    this.sentFrom = message.sentFrom?.text ?? null;
    this.sentTo = message.sentTo?.text ?? null;
    this.replyTo = message.replyTo?.text ?? null;
    this.cc = message.cc?.text ?? null;
    this.subject = message.subject;
    this.date = message.date;
    this.hasAttachment = message.hasAttachment;
    this.messageId = message.messageId;
    this.referencesTo = message.references;
    this.inReplyTo = message.inReplyTo;
    this.isSeen = message.isSeen;
    this.entityId = message.entityId;
    return this;
  }
}
