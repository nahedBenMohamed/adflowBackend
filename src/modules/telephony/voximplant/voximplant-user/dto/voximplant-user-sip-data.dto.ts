import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VoximplantUserSIPDataDto {
  @ApiProperty()
  @IsString()
  userName: string;

  @ApiProperty()
  @IsString()
  domain: string;

  @ApiProperty()
  @IsString()
  password: string;

  constructor({ userName, domain, password }: VoximplantUserSIPDataDto) {
    this.userName = userName;
    this.domain = domain;
    this.password = password;
  }
}
