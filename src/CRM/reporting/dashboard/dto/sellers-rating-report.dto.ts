import { ApiProperty } from '@nestjs/swagger';

import { PagingMeta } from '@/common';

import { UserQuantityAmountDto } from './user-quantity-amount.dto';

export class SellersRatingReportDto {
  @ApiProperty({ type: [UserQuantityAmountDto], description: 'Sellers rating' })
  users: UserQuantityAmountDto[];

  @ApiProperty({ type: PagingMeta, description: 'Paging metadata' })
  meta: PagingMeta;
}
