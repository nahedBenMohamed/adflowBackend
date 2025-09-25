import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class MailMessageScheduledDto {
  @ApiProperty({ description: 'Scheduled message ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'User ID who sent the message' })
  @IsNumber()
  sendFrom: number;

  @ApiProperty({ description: 'Date and time when the message was created' })
  @IsString()
  createdAt: string;

  @ApiProperty({ description: 'Mailbox ID' })
  @IsNumber()
  mailboxId: number;

  @ApiProperty({ description: 'Message subject' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Array of recipient email addresses' })
  @IsString({ each: true })
  sendTo: string[];

  @ApiPropertyOptional({ description: 'Entity ID associated with the message' })
  @IsNumber()
  entityId: number;

  @ApiPropertyOptional({ description: 'Date and time when the message was sent', nullable: true })
  @IsOptional()
  @IsNumber()
  sentAt?: string | null;
}
