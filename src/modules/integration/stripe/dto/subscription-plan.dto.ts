import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

import { SubscriptionPriceDto } from './subscription-price.dto';
import { SubscriptionFeatureDto } from './subscription-feature.dto';

export class SubscriptionPlanDto {
  @ApiProperty({ description: 'Stripe product id' })
  @IsString()
  id: string;

  @ApiPropertyOptional({ nullable: true, description: 'Subscription plan code' })
  @IsOptional()
  @IsString()
  code?: string | null;

  @ApiProperty({ description: 'Subscription product name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ nullable: true, description: 'Subscription product description' })
  @IsOptional()
  @IsString()
  description: string | null;

  @ApiPropertyOptional({ description: 'Subscription product order' })
  @IsOptional()
  @IsNumber()
  order?: number | null;

  @ApiProperty({ type: [SubscriptionPriceDto], description: 'Subscription plan prices' })
  @IsArray()
  prices: SubscriptionPriceDto[];

  @ApiPropertyOptional({ nullable: true, description: 'Default price id' })
  @IsOptional()
  @IsString()
  defaultPriceId?: string | null = null;

  @ApiPropertyOptional({ nullable: true, type: [SubscriptionFeatureDto], description: 'Subscription plan features' })
  @IsOptional()
  @IsArray()
  features?: SubscriptionFeatureDto[] | null;

  @ApiPropertyOptional({ description: 'Is subscription plan default' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ nullable: true, description: 'Subscription plan user limit' })
  @IsOptional()
  @IsNumber()
  userLimit?: number | null;
}
