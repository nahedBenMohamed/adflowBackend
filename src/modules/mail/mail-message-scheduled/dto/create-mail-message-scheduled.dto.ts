import { PickType } from '@nestjs/swagger';

import { MailMessageScheduledDto } from './mail-message-scheduled.dto';

export class CreateMailMessageScheduledDto extends PickType(MailMessageScheduledDto, [
  'mailboxId',
  'sendFrom',
  'subject',
  'content',
  'sendTo',
  'entityId',
] as const) {}
