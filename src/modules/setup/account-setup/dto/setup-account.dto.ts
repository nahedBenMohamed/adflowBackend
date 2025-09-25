import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { CreateAccountDto } from '@/modules/iam/account/dto/create-account.dto';

export class SetupAccountDto extends CreateAccountDto {
  @ApiPropertyOptional({ nullable: true, description: 'Referral code' })
  @IsOptional()
  @IsString()
  ref?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Promo code' })
  @IsOptional()
  @IsString()
  promoCode?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'RMS code' })
  @IsOptional()
  @IsString()
  rmsCode?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'RMS modules' })
  @IsOptional()
  @IsString()
  rmsModules?: string | null;

  @ApiPropertyOptional({ description: 'Appsumo code', nullable: true })
  @IsOptional()
  @IsString()
  appsumo?: string | null;

  @ApiPropertyOptional({ description: 'Extra user info', nullable: true })
  @IsOptional()
  extraUserInfo?: object | null;

  @ApiPropertyOptional({ description: 'First visit date', nullable: true })
  @IsOptional()
  @IsString()
  firstVisit?: string | null;
}
