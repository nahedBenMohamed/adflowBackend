import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { MailboxSignatureDto } from './mailbox-signature.dto';

export class CreateMailboxSignatureDto extends PickType(MailboxSignatureDto, [
  'name',
  'text',
  'linkedMailboxes',
] as const) {
  @ApiPropertyOptional({ description: 'Signature text is HTML' })
  @IsOptional()
  @IsBoolean()
  isHtml?: boolean;
}
