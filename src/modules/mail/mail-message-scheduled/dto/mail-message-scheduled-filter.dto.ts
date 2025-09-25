import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

import { DatePeriodFilter } from '@/common';

export class MailMessageScheduledFilterDto {
  @ApiPropertyOptional({ description: 'Mailbox IDs' })
  @IsOptional()
  @IsNumber({}, { each: true })
  mailboxId?: number[];

  @ApiPropertyOptional({ description: 'User IDs who sent the message' })
  @IsOptional()
  @IsNumber({}, { each: true })
  sendFrom?: number[];

  @ApiPropertyOptional({ description: 'Entity IDs' })
  @IsOptional()
  @IsNumber({}, { each: true })
  entityId?: number[];

  @ApiPropertyOptional({ description: 'Is the message sent' })
  @IsOptional()
  @IsBoolean()
  isSent?: boolean;

  @ApiPropertyOptional({ description: 'Date and time when the message was sent' })
  @IsOptional()
  sentAt?: DatePeriodFilter;

  @ApiPropertyOptional({ description: 'Date and time when the message was created' })
  @IsOptional()
  createdAt?: DatePeriodFilter;

  @ApiPropertyOptional({ description: 'Message subject' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'Message content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Recipient email address' })
  @IsOptional()
  @IsString()
  sentTo?: string;
}
