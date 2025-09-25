import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SubscriptionOrderDto {
  @ApiProperty({ nullable: true, description: 'Stripe product id' })
  @IsString()
  productId: string;

  @ApiPropertyOptional({ nullable: true, description: 'Stripe price id' })
  @IsOptional()
  @IsString()
  priceId?: string | null;

  @ApiProperty({ description: 'Number of users' })
  @IsNumber()
  numberOfUsers: number;

  @ApiPropertyOptional({ nullable: true, description: 'Payment amount' })
  @IsOptional()
  @IsNumber()
  amount?: number | null;

  @ApiPropertyOptional({ description: 'Discount code' })
  @IsOptional()
  @IsString()
  couponId?: string | null;
}
