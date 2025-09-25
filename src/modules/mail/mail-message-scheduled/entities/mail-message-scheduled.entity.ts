import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { CreateMailMessageScheduledDto, MailMessageScheduledDto } from '../dto';

@Entity()
export class MailMessageScheduled {
  @PrimaryGeneratedColumn('identity')
  id: number | undefined;

  @Column()
  accountId: number;

  @Column()
  sendFrom: number;

  @Column()
  createdAt: Date;

  @Column()
  mailboxId: number;

  @Column()
  subject: string;

  @Column()
  content: string;

  @Column({ type: 'simple-array' })
  sendTo: string[];

  @Column()
  entityId: number;

  @Column({ nullable: true })
  sentAt: Date | null;

  constructor(
    accountId: number,
    sendFrom: number,
    mailboxId: number,
    subject: string,
    content: string,
    sendTo: string[],
    entityId: number,
    createdAt: Date = new Date(),
    sentAt: Date | null = null,
  ) {
    this.accountId = accountId;
    this.sendFrom = sendFrom;
    this.createdAt = createdAt;
    this.mailboxId = mailboxId;
    this.subject = subject;
    this.content = content;
    this.sendTo = sendTo;
    this.entityId = entityId;
    this.sentAt = sentAt;
  }

  public static fromDto(accountId: number, dto: CreateMailMessageScheduledDto): MailMessageScheduled {
    return new MailMessageScheduled(
      accountId,
      dto.sendFrom,
      dto.mailboxId,
      dto.subject,
      dto.content,
      dto.sendTo,
      dto.entityId,
    );
  }

  public toDto(): MailMessageScheduledDto {
    return {
      id: this.id,
      sendFrom: this.sendFrom,
      createdAt: this.createdAt.toISOString(),
      mailboxId: this.mailboxId,
      subject: this.subject,
      content: this.content,
      sendTo: this.sendTo,
      entityId: this.entityId,
      sentAt: this.sentAt?.toISOString(),
    };
  }
}
