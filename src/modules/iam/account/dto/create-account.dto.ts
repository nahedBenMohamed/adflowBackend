import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

import { CreateAccountSettingsDto } from '../../account-settings/dto/create-account-settings.dto';

export class CreateAccountDto {
  @ApiProperty({ description: 'First name of the user' })
  @IsString()
  firstName: string;

  @ApiPropertyOptional({ description: 'Last name of the user', nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string | null;

  @ApiProperty({ description: 'Email of the user' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number of the user', nullable: true })
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiProperty({ description: 'Password of the user' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: 'Company name of the account', nullable: true })
  @IsOptional()
  @IsString()
  companyName?: string | null;

  @ApiPropertyOptional({ description: 'Settings of the account', type: CreateAccountSettingsDto, nullable: true })
  @IsOptional()
  settings?: CreateAccountSettingsDto | null;

  @ApiPropertyOptional({ description: 'User analytics id', nullable: true })
  @IsOptional()
  @IsString()
  userAnalyticsId?: string | null;
}
