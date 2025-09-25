import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { MailboxSettingsImapflowDto } from './mailbox-settings-imapflow.dto';

export class CreateMailboxSettingsImapflowDto extends PickType(MailboxSettingsImapflowDto, [
  'imapServer',
  'imapPort',
  'imapSecure',
  'smtpServer',
  'smtpPort',
  'smtpSecure',
] as const) {
  @ApiProperty({ description: 'Mail password' })
  @IsString()
  password: string;
}
