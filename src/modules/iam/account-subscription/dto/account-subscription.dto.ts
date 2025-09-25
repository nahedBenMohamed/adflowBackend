import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class AccountSubscriptionDto {
  @ApiProperty({ description: 'Is trial?' })
  @IsBoolean()
  isTrial: boolean;

  @ApiProperty({ description: 'Created at' })
  @IsString()
  createdAt: string;

  @ApiPropertyOptional({ nullable: true, description: 'Expired at' })
  @IsOptional()
  @IsString()
  expiredAt: string | null;

  @ApiProperty({ description: 'User limit' })
  @IsNumber()
  userLimit: number;

  @ApiProperty({ description: 'Is valid?' })
  @IsBoolean()
  isValid: boolean;

  @ApiProperty({ description: 'Plan name' })
  @IsString()
  planName: string;

  @ApiProperty({ description: 'Is external?' })
  @IsBoolean()
  isExternal: boolean;

  @ApiPropertyOptional({ description: 'First visit date' })
  @IsString()
  firstVisit: string;
}
