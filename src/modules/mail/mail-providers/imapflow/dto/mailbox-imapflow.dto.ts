import { ApiProperty } from '@nestjs/swagger';

import { MailboxDto } from '@/Mailing/mailbox/dto/mailbox.dto';
import { MailboxSettingsImapflowDto } from './mailbox-settings-imapflow.dto';

export class MailboxImapflowDto extends MailboxDto {
  @ApiProperty({ type: MailboxSettingsImapflowDto, description: 'Imapflow Settings' })
  settings: MailboxSettingsImapflowDto;
}
