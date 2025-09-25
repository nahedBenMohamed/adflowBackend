import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';

import { MailboxFolderType } from '../../../common';
import { MailboxShortInfoDto } from './mailbox-short-info.dto';

export class MailboxSectionDto {
  @ApiProperty({ enum: MailboxFolderType, description: 'Folder type' })
  @IsEnum(MailboxFolderType)
  type: MailboxFolderType;

  @ApiProperty({ description: 'Unread count' })
  @IsNumber()
  unread: number;

  @ApiProperty({ description: 'Total count' })
  @IsNumber()
  total: number;

  @ApiProperty({ type: [MailboxShortInfoDto], description: 'Mailboxes' })
  mailboxes: MailboxShortInfoDto[];

  constructor(type: MailboxFolderType) {
    this.type = type;
    this.unread = 0;
    this.total = 0;
    this.mailboxes = [];
  }

  addMailboxInfo(mailbox: MailboxShortInfoDto) {
    this.unread += mailbox.unread;
    this.total += mailbox.total;
    this.mailboxes.push(mailbox);
  }
}
