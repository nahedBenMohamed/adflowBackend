import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class VoximplantAccountDto {
  @ApiProperty()
  @IsNumber()
  accountId: number;

  @ApiProperty()
  @IsString()
  accountName: string;

  @ApiProperty()
  @IsString()
  apiKey: string;

  @ApiProperty()
  @IsNumber()
  billingAccountId: number;

  @ApiProperty()
  @IsNumber()
  applicationId: number;

  @ApiProperty()
  @IsString()
  applicationName: string;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  constructor(
    accountId: number,
    accountName: string,
    apiKey: string,
    billingAccountId: number,
    applicationId: number,
    applicationName: string,
    isActive: boolean,
  ) {
    this.accountId = accountId;
    this.accountName = accountName;
    this.apiKey = apiKey;
    this.billingAccountId = billingAccountId;
    this.applicationId = applicationId;
    this.applicationName = applicationName;
    this.isActive = isActive;
  }
}
