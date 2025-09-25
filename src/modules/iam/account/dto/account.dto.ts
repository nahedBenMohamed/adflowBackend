import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AccountDto {
  @ApiProperty({ description: 'Account id' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Company name of the account' })
  @IsString()
  companyName: string;

  @ApiProperty({ description: 'Subdomain of the account' })
  @IsString()
  subdomain: string;

  @ApiProperty({ description: 'Account creation date' })
  @IsString()
  createdAt: string;

  @ApiPropertyOptional({ description: 'Logo url of the account', nullable: true })
  @IsOptional()
  @IsString()
  logoUrl?: string | null;
}
