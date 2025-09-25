import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsDefined, ValidateNested } from 'class-validator';

import { CreateMailboxDto } from '@/Mailing/mailbox/dto';
import { CreateMailboxSettingsImapflowDto } from './create-mailbox-settings-imapflow.dto';

export class CreateMailboxImapflowDto extends OmitType(CreateMailboxDto, ['provider'] as const) {
  @ApiProperty({ type: CreateMailboxSettingsImapflowDto, description: 'Imapflow Settings' })
  @IsDefined()
  @ValidateNested()
  settings: CreateMailboxSettingsImapflowDto;
}
