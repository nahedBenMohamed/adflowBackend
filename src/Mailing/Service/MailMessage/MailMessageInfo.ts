import { ApiProperty } from '@nestjs/swagger';

import { EntityInfoDto } from '@/modules/entity/entity-info/dto/entity-info.dto';

import { MailMessage } from '../../Model/MailMessage/MailMessage';

export class MailMessageInfo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  mailboxId: number;

  @ApiProperty()
  threadId: string | null;

  @ApiProperty()
  snippet: string | null;

  @ApiProperty()
  sentFrom: string | null;

  @ApiProperty()
  sentTo: string | null;

  @ApiProperty()
  subject: string | null;

  @ApiProperty()
  date: string;

  @ApiProperty()
  hasAttachment: boolean;

  @ApiProperty()
  isSeen: boolean;

  @ApiProperty()
  folders: string[];

  @ApiProperty({ nullable: true, type: EntityInfoDto })
  entityInfo: EntityInfoDto | null;

  constructor(
    id: number,
    mailboxId: number,
    threadId: string | null,
    snippet: string | null,
    sentFrom: string | null,
    sentTo: string | null,
    subject: string | null,
    date: string,
    hasAttachment: boolean,
    isSeen: boolean,
    folders: string[],
    entityInfo: EntityInfoDto | null,
  ) {
    this.id = id;
    this.mailboxId = mailboxId;
    this.threadId = threadId;
    this.snippet = snippet;
    this.sentFrom = sentFrom;
    this.sentTo = sentTo;
    this.subject = subject;
    this.date = date;
    this.hasAttachment = hasAttachment;
    this.isSeen = isSeen;
    this.folders = folders;
    this.entityInfo = entityInfo;
  }

  public static create(message: MailMessage, folders: string[], entityInfo: EntityInfoDto | null): MailMessageInfo {
    return new MailMessageInfo(
      message.id,
      message.mailboxId,
      message.threadId,
      message.snippet,
      message.sentFrom,
      message.sentTo,
      message.subject,
      message.date.toISOString(),
      message.hasAttachment,
      message.isSeen,
      folders,
      entityInfo,
    );
  }
}
