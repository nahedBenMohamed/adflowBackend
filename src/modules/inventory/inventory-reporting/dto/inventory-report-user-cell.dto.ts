import { ApiProperty } from '@nestjs/swagger';

import { QuantityAmountDto } from '@/common';

export class InventoryReportUserCellDto {
  @ApiProperty()
  userId: number;

  @ApiProperty({ type: QuantityAmountDto })
  value: QuantityAmountDto;

  constructor({ userId, value }: InventoryReportUserCellDto) {
    this.userId = userId;
    this.value = value;
  }
}
