import { ApiProperty } from '@nestjs/swagger';

import { EntityInfoDto } from '@/modules/entity/entity-info/dto/entity-info.dto';

import { MailMessagePayloadDto } from '../../../mail-message-payload';
import { MailMessage } from '../../../Model/MailMessage/MailMessage';

export class MailMessageDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  mailboxId: number;

  @ApiProperty()
  threadId: string;

  @ApiProperty()
  snippet: string | null;

  @ApiProperty()
  sentFrom: string | null;

  @ApiProperty()
  sentTo: string | null;

  @ApiProperty()
  replyTo: string | null;

  @ApiProperty()
  cc: string | null;

  @ApiProperty()
  subject: string | null;

  @ApiProperty()
  date: string;

  @ApiProperty()
  hasAttachment: boolean;

  @ApiProperty()
  isSeen: boolean;

  @ApiProperty()
  payloads: MailMessagePayloadDto[];

  @ApiProperty({ nullable: true })
  entityInfo: EntityInfoDto | null;

  constructor(
    id: number,
    mailboxId: number,
    threadId: string,
    snippet: string | null,
    sentFrom: string,
    sentTo: string | null,
    replyTo: string | null,
    cc: string | null,
    subject: string | null,
    date: string,
    hasAttachment: boolean,
    isSeen: boolean,
    payloads: MailMessagePayloadDto[],
    entityInfo: EntityInfoDto | null,
  ) {
    this.id = id;
    this.mailboxId = mailboxId;
    this.threadId = threadId;
    this.snippet = snippet;
    this.sentFrom = sentFrom;
    this.sentTo = sentTo;
    this.replyTo = replyTo;
    this.cc = cc;
    this.subject = subject;
    this.date = date;
    this.hasAttachment = hasAttachment;
    this.isSeen = isSeen;
    this.payloads = payloads;
    this.entityInfo = entityInfo;
  }

  static create(
    message: MailMessage,
    payloads: MailMessagePayloadDto[],
    entityInfo: EntityInfoDto | null,
  ): MailMessageDto {
    return new MailMessageDto(
      message.id,
      message.mailboxId,
      message.threadId,
      message.snippet,
      message.sentFrom,
      message.sentTo,
      message.replyTo,
      message.cc,
      message.subject,
      message.date.toISOString(),
      message.hasAttachment,
      message.isSeen,
      payloads,
      entityInfo,
    );
  }
}
