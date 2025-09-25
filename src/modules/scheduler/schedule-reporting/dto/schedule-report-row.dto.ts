import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { QuantityAmountDto } from '@/common';

export class ScheduleReportRowDto {
  @ApiProperty({ nullable: true, description: 'Owner ID' })
  @IsOptional()
  @IsNumber()
  ownerId: number | null;

  @ApiProperty({ nullable: true, description: 'Owner name' })
  @IsOptional()
  @IsString()
  ownerName: string | null;

  @ApiProperty({ type: QuantityAmountDto, description: 'Sold' })
  sold: QuantityAmountDto;

  @ApiProperty({ description: 'All' })
  @IsNumber()
  all: number;

  @ApiProperty({ description: 'Scheduled' })
  @IsNumber()
  scheduled: number;

  @ApiProperty({ description: 'Confirmed' })
  @IsNumber()
  confirmed: number;

  @ApiProperty({ description: 'Completed' })
  @IsNumber()
  completed: number;

  @ApiProperty({ description: 'Canceled' })
  @IsNumber()
  canceled: number;
}
