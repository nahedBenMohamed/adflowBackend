import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { OrderStatusCode } from '../enums/order-status-code.enum';

export class OrderStatusDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  color: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(OrderStatusCode)
  code: OrderStatusCode | null;

  @ApiProperty()
  @IsNumber()
  sortOrder: number;

  constructor(id: number, name: string, color: string, code: OrderStatusCode | null, sortOrder: number) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.code = code;
    this.sortOrder = sortOrder;
  }
}
