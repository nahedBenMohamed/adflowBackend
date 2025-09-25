import { ApiProperty } from '@nestjs/swagger';

import { QuantityAmountDto } from '@/common';

export class ComparativeReportValueDto {
  @ApiProperty({ type: QuantityAmountDto, description: 'Current value' })
  current: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto, description: 'Previous value' })
  previous: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto, description: 'Difference' })
  difference: QuantityAmountDto;
}
