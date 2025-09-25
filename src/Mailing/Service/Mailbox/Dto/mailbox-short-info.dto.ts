import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';

import { MailboxState } from '../../../common';

export class MailboxShortInfoDto {
  @ApiProperty({ description: 'Mailbox ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Mailbox name (email' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unread count' })
  @IsNumber()
  unread: number;

  @ApiProperty({ description: 'Total count' })
  @IsNumber()
  total: number;

  @ApiProperty({ enum: MailboxState, description: 'Mailbox state' })
  @IsEnum(MailboxState)
  state: MailboxState;
}
