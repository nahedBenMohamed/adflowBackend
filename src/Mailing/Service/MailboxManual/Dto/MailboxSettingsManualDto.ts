import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

import { MailboxSettingsManual } from '../../../Model/MailboxManual/MailboxSettingsManual';

export class MailboxSettingsManualDto {
  @ApiProperty()
  @IsString()
  imapServer: string;

  @ApiProperty()
  @IsNumber()
  imapPort: number;

  @ApiProperty()
  @IsBoolean()
  imapSecure: boolean;

  @ApiProperty()
  @IsString()
  smtpServer: string;

  @ApiProperty()
  @IsNumber()
  smtpPort: number;

  @ApiProperty()
  @IsBoolean()
  smtpSecure: boolean;

  private constructor(
    imapServer: string,
    imapPort: number,
    imapSecure: boolean,
    smtpServer: string,
    smtpPort: number,
    smtpSecure: boolean,
  ) {
    this.imapServer = imapServer;
    this.imapPort = imapPort;
    this.imapSecure = imapSecure;
    this.smtpServer = smtpServer;
    this.smtpPort = smtpPort;
    this.smtpSecure = smtpSecure;
  }

  public static create(settings: MailboxSettingsManual): MailboxSettingsManualDto {
    return new MailboxSettingsManualDto(
      settings.imapServer,
      settings.imapPort,
      settings.imapSecure,
      settings.smtpServer,
      settings.smtpPort,
      settings.smtpSecure,
    );
  }

  public static createDefault(): MailboxSettingsManualDto {
    return new MailboxSettingsManualDto('', 0, true, '', 0, true);
  }
}
