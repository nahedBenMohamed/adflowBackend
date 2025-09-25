import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ProductStockDto {
  @ApiProperty()
  @IsNumber()
  warehouseId: number;

  @ApiProperty()
  @IsNumber()
  stockQuantity: number;

  @ApiProperty()
  @IsNumber()
  reserved: number;

  @ApiProperty()
  @IsNumber()
  available: number;
}
