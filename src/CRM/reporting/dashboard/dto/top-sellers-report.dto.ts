import { ApiProperty } from '@nestjs/swagger';

import { QuantityAmountDto } from '@/common';

import { UserQuantityAmountDto } from './user-quantity-amount.dto';

export class TopSellersReportDto {
  @ApiProperty({ type: [UserQuantityAmountDto], description: 'List of users with quantity and amount' })
  users: UserQuantityAmountDto[];

  @ApiProperty({ type: QuantityAmountDto, description: 'Other users with quantity and amount' })
  others: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto, description: 'Total quantity and amount' })
  total: QuantityAmountDto;
}
