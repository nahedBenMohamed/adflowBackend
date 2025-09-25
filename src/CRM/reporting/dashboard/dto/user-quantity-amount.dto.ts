import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { QuantityAmountDto } from '@/common';

export class UserQuantityAmountDto extends QuantityAmountDto {
  @ApiProperty({ description: 'User ID' })
  @IsNumber()
  userId: number;
}
