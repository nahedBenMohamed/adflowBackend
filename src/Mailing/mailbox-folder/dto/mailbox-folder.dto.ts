import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { MailboxFolderType } from '../../common';

export class MailboxFolderDto {
  @ApiProperty({ description: 'Mailbox folder ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ enum: MailboxFolderType, nullable: true, description: 'Mailbox folder type' })
  @IsOptional()
  @IsEnum(MailboxFolderType)
  type: MailboxFolderType | null;

  @ApiProperty({ description: 'Mailbox folder name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unread mail count', nullable: true })
  @IsOptional()
  @IsNumber()
  unread: number | null;

  @ApiProperty({ description: 'Total mail count', nullable: true })
  @IsOptional()
  @IsNumber()
  total: number | null;

  @ApiPropertyOptional({ description: 'Child folders', type: [MailboxFolderDto], nullable: true })
  @IsOptional()
  folders?: MailboxFolderDto[] | null;
}
