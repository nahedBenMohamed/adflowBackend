import { ApiPropertyOptional } from '@nestjs/swagger';

import { UpdateMailboxDto } from '@/Mailing/mailbox/dto';
import { UpdateMailboxSettingsImapflowDto } from './update-mailbox-settings-imapflow.dto';

export class UpdateMailboxImapflowDto extends UpdateMailboxDto {
  @ApiPropertyOptional({ type: UpdateMailboxSettingsImapflowDto, description: 'Imapflow Settings' })
  settings?: UpdateMailboxSettingsImapflowDto;
}
