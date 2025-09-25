import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ReservationDto {
  @ApiProperty()
  @IsNumber()
  warehouseId: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  constructor(warehouseId: number, quantity: number) {
    this.warehouseId = warehouseId;
    this.quantity = quantity;
  }
}
