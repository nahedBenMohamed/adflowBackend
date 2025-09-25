import { ApiProperty } from '@nestjs/swagger';

import { QuantityAmountDto } from '@/common';

export class CallReportBlockDto {
  @ApiProperty({ type: QuantityAmountDto, description: 'All calls' })
  all: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto, description: 'Incoming calls' })
  incoming: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto, description: 'Outgoing calls' })
  outgoing: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto, description: 'Missed calls' })
  missed: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto, description: 'Average for all calls' })
  avgAll: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto, description: 'Average for incoming calls' })
  avgIncoming: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto, description: 'Average for outgoing calls' })
  avgOutgoing: QuantityAmountDto;
}
