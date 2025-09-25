import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSalesforceSettingsDto {
  @ApiProperty()
  @IsString()
  domain: string;

  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  secret: string;
}
