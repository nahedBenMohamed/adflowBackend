import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { MailboxState } from '../../common';
import { MailboxEntitySettingsDto } from './mailbox-entity-settings.dto';

export class MailboxDto {
  @ApiProperty({ description: 'Mailbox ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Mailbox email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mailbox provider' })
  @IsString()
  provider: string;

  @ApiPropertyOptional({ nullable: true, description: 'Owner ID' })
  @IsOptional()
  @IsNumber()
  ownerId?: number | null;

  @ApiPropertyOptional({ type: [Number], description: 'Accessible user IDs', nullable: true })
  @IsOptional()
  @IsNumber({}, { each: true })
  accessibleUserIds?: number[] | null;

  @ApiProperty({ enum: MailboxState, description: 'Mailbox state' })
  @IsEnum(MailboxState)
  state: MailboxState;

  @ApiProperty({ nullable: true, description: 'Error message' })
  @IsOptional()
  @IsString()
  errorMessage: string | null;

  @ApiProperty({ nullable: true, description: 'Emails per day' })
  @IsOptional()
  @IsNumber()
  emailsPerDay?: number | null;

  @ApiPropertyOptional({ type: MailboxEntitySettingsDto, description: 'Entity settings', nullable: true })
  @IsOptional()
  entitySettings?: MailboxEntitySettingsDto | null;
}
