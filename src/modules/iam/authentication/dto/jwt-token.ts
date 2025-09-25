import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class JwtToken {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsString()
  subdomain: string;

  @ApiProperty()
  @IsNumber()
  accountId: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPartner?: boolean | null;

  constructor({ token, accountId, userId, subdomain, isPartner }: JwtToken) {
    this.token = token;
    this.accountId = accountId;
    this.userId = userId;
    this.subdomain = subdomain;
    this.isPartner = isPartner;
  }
}
