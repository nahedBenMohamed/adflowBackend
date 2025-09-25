import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class VoximplantSIPRegistrationDto {
  @ApiProperty({ description: 'The SIP registration ID' })
  @IsNumber()
  sipRegistrationId: number;

  @ApiProperty({ description: 'The SIP username' })
  @IsString()
  sipUsername: string;

  @ApiProperty({ description: 'The SIP proxy' })
  @IsString()
  proxy: string;

  @ApiProperty({ description: 'The last time updated' })
  @IsNumber()
  lastUpdated: number;

  @ApiPropertyOptional({ description: 'The SIP authentications user' })
  @IsOptional()
  @IsString()
  authUser?: string;

  @ApiPropertyOptional({ description: 'The SIP outbound proxy' })
  @IsOptional()
  @IsString()
  outboundProxy?: string;

  @ApiPropertyOptional({ description: 'The successful SIP registration' })
  @IsOptional()
  @IsBoolean()
  successful?: boolean;

  @ApiPropertyOptional({ description: 'The status code from a SIP registration' })
  @IsOptional()
  @IsNumber()
  statusCode?: number;

  @ApiPropertyOptional({ description: 'The error message from a SIP registration' })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiProperty({ description: 'The subscription deactivation flag' })
  @IsBoolean()
  deactivated: boolean;

  @ApiProperty({ description: 'The next subscription renewal date' })
  @IsString()
  nextSubscriptionRenewal: Date;

  @ApiProperty({ description: 'The purchase date in 24-h format: YYYY-MM-DD HH:mm:ss' })
  @IsString()
  purchaseDate: Date;

  @ApiProperty({ description: 'The subscription monthly charge' })
  @IsString()
  subscriptionPrice: string;

  @ApiProperty({ description: 'SIP registration is persistent' })
  @IsBoolean()
  isPersistent: boolean;

  @ApiPropertyOptional({ description: 'The id of the bound user' })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({ description: 'The name of the bound user' })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiPropertyOptional({ description: 'The id of the bound rule' })
  @IsOptional()
  @IsNumber()
  ruleId?: number;

  @ApiPropertyOptional({ description: 'The name of the bound rule' })
  @IsOptional()
  @IsString()
  ruleName?: string;
}
