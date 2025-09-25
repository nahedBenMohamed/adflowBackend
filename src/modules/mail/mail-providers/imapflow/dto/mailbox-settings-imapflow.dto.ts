import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class MailboxSettingsImapflowDto {
  @ApiProperty({ description: 'IMAP server address' })
  @IsString()
  imapServer: string;

  @ApiProperty({ description: 'IMAP server port' })
  @IsNumber()
  imapPort: number;

  @ApiProperty({ description: 'IMAP server secure' })
  @IsBoolean()
  imapSecure: boolean;

  @ApiProperty({ description: 'SMTP server address' })
  @IsString()
  smtpServer: string;

  @ApiProperty({ description: 'SMTP server port' })
  @IsNumber()
  smtpPort: number;

  @ApiProperty({ description: 'SMTP server secure' })
  @IsBoolean()
  smtpSecure: boolean;
}
