import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginLinkDto {
  @ApiProperty()
  @IsString()
  loginLink: string;

  @ApiProperty()
  @IsString()
  subdomain: string;

  constructor(loginLink: string, subdomain: string) {
    this.loginLink = loginLink;
    this.subdomain = subdomain;
  }
}
