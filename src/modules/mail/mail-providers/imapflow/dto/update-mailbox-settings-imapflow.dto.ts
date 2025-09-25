import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { MailboxSettingsImapflowDto } from './mailbox-settings-imapflow.dto';

export class UpdateMailboxSettingsImapflowDto extends PartialType(
  PickType(MailboxSettingsImapflowDto, [
    'imapServer',
    'imapPort',
    'imapSecure',
    'smtpServer',
    'smtpPort',
    'smtpSecure',
  ] as const),
) {
  @ApiPropertyOptional({ description: 'Mail password' })
  @IsOptional()
  @IsString()
  password?: string;
}
