import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CurrentDiscountDto {
  @ApiProperty({ description: 'Discount percent', example: 10 })
  @IsNumber()
  percent: number;

  @ApiProperty({ description: 'Discount end date in ISO format', example: new Date() })
  @IsDateString()
  endAt: string;

  @ApiPropertyOptional({ nullable: true, description: 'Discount code' })
  @IsOptional()
  @IsNumber()
  code?: string | null;
}
