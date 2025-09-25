import { ApiProperty } from '@nestjs/swagger';
import { SalesPlanValueDto } from './sales-plan-value.dto';

export class SalesPlanReportDto {
  @ApiProperty({ type: SalesPlanValueDto, description: 'Sales plan amount' })
  amount: SalesPlanValueDto;

  @ApiProperty({ type: SalesPlanValueDto, description: 'Sales plan quantity' })
  quantity: SalesPlanValueDto;
}
