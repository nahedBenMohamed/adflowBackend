import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

import { DatePeriodFilterType } from '../../enums';

export class DatePeriodFilter {
  @ApiProperty({ description: 'Type of date period', required: false, enum: DatePeriodFilterType })
  @IsOptional()
  @IsEnum(DatePeriodFilterType)
  type?: DatePeriodFilterType;

  @ApiProperty({ description: 'From date', required: false })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiProperty({ description: 'To date', required: false })
  @IsOptional()
  @IsDateString()
  to?: string;
}
