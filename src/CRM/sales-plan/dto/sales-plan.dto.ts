import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional } from 'class-validator';

import { DatePeriodDto } from '@/common';

export class SalesPlanDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty({ type: DatePeriodDto })
  @IsObject()
  period: DatePeriodDto;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  quantity: number | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  amount: number | null;

  constructor(userId: number, period: DatePeriodDto, quantity: number | null, amount: number | null) {
    this.userId = userId;
    this.period = period;
    this.quantity = quantity;
    this.amount = amount;
  }
}
