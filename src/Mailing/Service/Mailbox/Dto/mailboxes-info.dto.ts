import { ApiProperty } from '@nestjs/swagger';

import { MailboxSectionDto } from './mailbox-section.dto';
import { MailboxFullInfoDto } from './mailbox-full-info.dto';

export class MailboxesInfoDto {
  @ApiProperty({ type: [MailboxSectionDto], description: 'Mailboxes by sections' })
  sections: MailboxSectionDto[];

  @ApiProperty({ type: [MailboxFullInfoDto], description: 'Mailboxes' })
  mailboxes: MailboxFullInfoDto[];
}
