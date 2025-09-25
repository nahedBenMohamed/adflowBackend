import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PhoneNumberDto {
  @ApiProperty()
  @IsString()
  externalId: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  countryCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  regionName?: string;

  constructor({ externalId, phoneNumber, countryCode, regionName }: PhoneNumberDto) {
    this.externalId = externalId;
    this.phoneNumber = phoneNumber;
    this.countryCode = countryCode;
    this.regionName = regionName;
  }
}
