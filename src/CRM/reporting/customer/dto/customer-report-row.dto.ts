import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { QuantityAmountDto } from '@/common';
import { CustomerReportFieldDto } from './customer-report-field.dto';

export class CustomerReportRowDto {
  @ApiProperty({ description: 'Owner ID' })
  @IsNumber()
  ownerId: number;

  @ApiProperty({ description: 'Owner entity type ID' })
  @IsNumber()
  ownerEntityTypeId: number;

  @ApiProperty({ description: 'Owner name' })
  @IsString()
  ownerName: string;

  @ApiProperty({ description: 'Won product quantity' })
  @IsNumber()
  wonProductQuantity: number;

  @ApiProperty({ type: QuantityAmountDto, description: 'Won quantity and amount' })
  won: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto, description: 'Open quantity and amount' })
  open: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto, description: 'Lost quantity and amount' })
  lost: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto, description: 'All quantity and amount' })
  all: QuantityAmountDto;

  @ApiProperty({ description: 'Average won deal quantity' })
  @IsNumber()
  avgWonDealQuantity: number;

  @ApiProperty({ description: 'Average won deal budget' })
  @IsNumber()
  avgWonDealBudget: number;

  @ApiProperty({ description: 'Average won deal time' })
  @IsNumber()
  avgWonDealTime: number;

  @ApiPropertyOptional({ type: [CustomerReportFieldDto], nullable: true, description: 'Fields' })
  @IsOptional()
  fields?: CustomerReportFieldDto[] | null;
}
