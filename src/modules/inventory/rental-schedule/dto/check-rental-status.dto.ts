import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

import { DatePeriodDto } from '@/common';

export class CheckRentalStatusDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  productIds: number[];

  @ApiProperty({ type: [DatePeriodDto] })
  @IsArray()
  periods: DatePeriodDto[];

  constructor(productIds: number[], periods: DatePeriodDto[]) {
    this.productIds = productIds;
    this.periods = periods;
  }
}
