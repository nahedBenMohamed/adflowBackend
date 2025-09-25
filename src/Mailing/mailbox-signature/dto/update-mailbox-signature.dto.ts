import { PartialType, PickType } from '@nestjs/swagger';

import { MailboxSignatureDto } from './mailbox-signature.dto';

export class UpdateMailboxSignatureDto extends PartialType(
  PickType(MailboxSignatureDto, ['name', 'text', 'isHtml', 'linkedMailboxes'] as const),
) {}
