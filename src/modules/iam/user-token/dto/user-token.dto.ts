import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserTokenDto {
  @ApiProperty({ description: 'User access token ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'User access token name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'User access token created at' })
  @IsDateString()
  createdAt: string;

  @ApiPropertyOptional({ description: 'User access token expires at' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;

  @ApiPropertyOptional({ description: 'User access token last used at' })
  @IsOptional()
  @IsDateString()
  lastUsedAt?: string | null;
}
