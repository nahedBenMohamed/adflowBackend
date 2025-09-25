import { ApiProperty } from '@nestjs/swagger';

import { QuantityAmountDto } from '@/common';

export class EntitySummaryReportDto {
  @ApiProperty({ type: QuantityAmountDto, description: 'Total quantity and amount' })
  total: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto, description: 'Won quantity and amount' })
  win: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto, description: 'Lost quantity and amount' })
  lost: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto, description: 'New quantity and amount' })
  new: QuantityAmountDto;
}
