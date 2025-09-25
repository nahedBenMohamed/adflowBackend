import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class PhoneUserInfoDto {
  @ApiProperty({ description: 'UTC offset' })
  @IsNumber()
  utcOffset: number | null;

  @ApiProperty({ description: 'Country name' })
  @IsString()
  country: string | null;

  @ApiProperty({ description: 'Region name' })
  @IsString()
  region: string | null;

  @ApiProperty({ description: 'City name' })
  @IsString()
  city: string | null;
}
