import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { MailboxDto } from './mailbox.dto';

export class CreateMailboxDto extends PickType(MailboxDto, [
  'ownerId',
  'provider',
  'email',
  'accessibleUserIds',
  'emailsPerDay',
  'entitySettings',
] as const) {
  @ApiPropertyOptional({ nullable: true, description: 'Sync days' })
  @IsOptional()
  @IsNumber()
  syncDays?: number | null;
}
