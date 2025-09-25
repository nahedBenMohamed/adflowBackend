import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';

import { MailboxState } from '../../../common';
import { Mailbox } from '../../../mailbox/entities';
import { MailboxFolderDto } from '../../../mailbox-folder';

export class MailboxFullInfoDto {
  @ApiProperty({ description: 'Mailbox ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Mailbox name (email' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Owner ID' })
  @IsNumber()
  ownerId: number;

  @ApiProperty({ description: 'Unread count' })
  @IsNumber()
  unread: number;

  @ApiProperty({ description: 'Total count' })
  @IsNumber()
  total: number;

  @ApiProperty({ enum: MailboxState, description: 'Mailbox state' })
  @IsEnum(MailboxState)
  state: MailboxState;

  @ApiProperty({ type: [MailboxFolderDto], description: 'Mailbox folders' })
  folders: MailboxFolderDto[];

  constructor(
    id: number,
    name: string,
    ownerId: number,
    unread: number,
    total: number,
    state: MailboxState,
    folders: MailboxFolderDto[],
  ) {
    this.id = id;
    this.name = name;
    this.ownerId = ownerId;
    this.unread = unread;
    this.total = total;
    this.state = state;
    this.folders = folders;
  }

  static create(mailbox: Mailbox, folders: MailboxFolderDto[]): MailboxFullInfoDto {
    const unread = folders.reduce((acc, cur) => acc + cur.unread, 0);
    const total = folders.reduce((acc, cur) => acc + cur.total, 0);
    return new MailboxFullInfoDto(mailbox.id, mailbox.email, mailbox.ownerId, unread, total, mailbox.state, folders);
  }
}
