import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { SalesPipelineReportRowDto } from './sales-pipeline-report-row.dto';

export class SalesPipelineReportDto {
  @ApiProperty({ nullable: true, description: 'Total sales' })
  @IsOptional()
  @IsNumber()
  totalSales: number | null;

  @ApiProperty({ nullable: true, description: 'Conversion to sale' })
  @IsOptional()
  @IsNumber()
  conversionToSale: number | null;

  @ApiProperty({ nullable: true, description: 'Average amount' })
  @IsOptional()
  @IsNumber()
  averageAmount: number | null;

  @ApiProperty({ nullable: true, description: 'Average term' })
  @IsOptional()
  @IsNumber()
  averageTerm: number | null;

  @ApiProperty({ type: [SalesPipelineReportRowDto], description: 'Rows' })
  rows: SalesPipelineReportRowDto[];
}
