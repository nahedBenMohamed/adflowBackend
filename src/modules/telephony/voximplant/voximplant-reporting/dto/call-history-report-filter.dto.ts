import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';

import { DatePeriodFilter, NumberFilter } from '@/common';
import { CallDirection, CallStatus } from '../../common';

export class CallHistoryReportFilterDto {
  @ApiPropertyOptional({ type: Number, nullable: true, description: 'Entity type ID' })
  @IsOptional()
  @IsNumber()
  entityTypeId?: number | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'User IDs' })
  @IsOptional()
  @IsArray()
  userIds?: number[] | null;

  @ApiPropertyOptional({ enum: CallDirection, nullable: true, description: 'Call direction' })
  @IsOptional()
  @IsEnum(CallDirection)
  direction?: CallDirection | null;

  @ApiPropertyOptional({ type: DatePeriodFilter, nullable: true, description: 'Period' })
  @IsOptional()
  period?: DatePeriodFilter | null;

  @ApiPropertyOptional({ type: NumberFilter, nullable: true, description: 'Duration' })
  @IsOptional()
  duration?: NumberFilter | null;

  @ApiPropertyOptional({ enum: CallStatus, nullable: true, description: 'Call status' })
  @IsOptional()
  @IsEnum(CallStatus)
  status?: CallStatus | null;
}
