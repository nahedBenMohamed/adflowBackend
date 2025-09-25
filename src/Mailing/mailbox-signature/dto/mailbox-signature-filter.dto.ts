import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class MailboxSignatureFilterDto {
  @ApiPropertyOptional({ nullable: true, description: 'Mailbox ID' })
  @IsOptional()
  @IsNumber()
  mailboxId?: number | null;
}
