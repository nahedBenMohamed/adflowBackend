import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ShipmentItemDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}
