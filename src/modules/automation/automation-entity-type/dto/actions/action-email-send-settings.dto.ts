import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

import { ActionsSettings } from '../../../common';
import { ActionSendOptions } from './action-send-options.dto';

export class ActionEmailSendSettings extends ActionsSettings {
  @ApiProperty({ description: 'Subject of the email' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Content of the email' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Signature of the email', nullable: true })
  @IsOptional()
  @IsString()
  signature?: string | null;

  @ApiProperty({ description: 'Is the email content HTML?' })
  @IsBoolean()
  sendAsHtml: boolean;

  @ApiProperty({ description: 'Mailbox ID' })
  @IsNumber()
  mailboxId: number;

  @ApiProperty({ description: 'Send email from User ID' })
  @IsNumber()
  userId: number;

  @ApiPropertyOptional({ description: 'Email send options', nullable: true, type: ActionSendOptions })
  @IsOptional()
  options?: ActionSendOptions | null;
}
