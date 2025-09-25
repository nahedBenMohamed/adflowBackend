import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class SalesPlanProgressDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  currentQuantity: number | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  currentAmount: number | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  plannedQuantity: number | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  plannedAmount: number | null;

  constructor(
    userId: number,
    currentQuantity: number | null,
    currentAmount: number | null,
    plannedQuantity: number | null,
    plannedAmount: number | null,
  ) {
    this.userId = userId;
    this.currentQuantity = currentQuantity;
    this.currentAmount = currentAmount;
    this.plannedQuantity = plannedQuantity;
    this.plannedAmount = plannedAmount;
  }
}
