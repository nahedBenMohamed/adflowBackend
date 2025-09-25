import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ChatUserExternalDto {
  @ApiProperty()
  @IsString()
  externalId: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  avatarUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  link?: string | null;

  constructor(
    externalId: string,
    firstName?: string,
    lastName?: string | null,
    avatarUrl?: string | null,
    phone?: string | null,
    email?: string | null,
    link?: string | null,
  ) {
    this.externalId = externalId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.avatarUrl = avatarUrl;
    this.phone = phone;
    this.email = email;
    this.link = link;
  }
}
