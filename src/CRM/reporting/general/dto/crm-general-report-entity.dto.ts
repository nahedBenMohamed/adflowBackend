import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { QuantityAmountDto } from '@/common';

export class CrmGeneralReportEntityDto {
  @ApiProperty({ type: QuantityAmountDto })
  all: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto })
  open: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto })
  lost: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto })
  won: QuantityAmountDto;

  @ApiProperty()
  @IsNumber()
  avgAmount: number;

  @ApiProperty()
  @IsNumber()
  avgClose: number;

  constructor(
    all: QuantityAmountDto,
    open: QuantityAmountDto,
    lost: QuantityAmountDto,
    won: QuantityAmountDto,
    avgAmount: number,
    avgClose: number,
  ) {
    this.all = all;
    this.open = open;
    this.lost = lost;
    this.won = won;
    this.avgAmount = avgAmount;
    this.avgClose = avgClose;
  }
}
