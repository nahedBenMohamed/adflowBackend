import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

import { DatePeriodFilter } from '@/common';

export class ChatMessageScheduledFilterDto {
  @ApiPropertyOptional({ description: 'Provider IDs' })
  @IsOptional()
  @IsNumber({}, { each: true })
  providerId?: number[];

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

  @ApiPropertyOptional({ description: 'Message text' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Recipient (phone numbers)' })
  @IsOptional()
  @IsString()
  sentTo?: string;
}
