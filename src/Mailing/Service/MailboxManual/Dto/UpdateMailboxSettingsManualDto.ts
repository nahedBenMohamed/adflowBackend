import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMailboxSettingsManualDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  password: string | null;

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
}
