import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class SubscriptionFeatureDto {
  @ApiProperty({ description: 'Subscription feature name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Is subscription feature available' })
  @IsBoolean()
  available: boolean;
}
