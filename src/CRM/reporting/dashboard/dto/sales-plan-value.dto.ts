import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SalesPlanValueDto {
  @ApiProperty({ description: 'The current value of the sales plan' })
  @IsNumber()
  current: number;

  @ApiProperty({ description: 'The planned value for today' })
  @IsNumber()
  plannedToday: number;

  @ApiProperty({ description: 'The planned total value' })
  @IsNumber()
  plannedTotal: number;
}
