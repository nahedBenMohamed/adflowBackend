import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class SubscriptionPriceDto {
  @ApiProperty({ description: 'Stripe price id' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Price amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Price currency' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Price interval' })
  @IsString()
  interval: string;
}
