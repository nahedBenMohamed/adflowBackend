import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { PagingQuery } from '@/common';

export class ShipmentFilterDto extends PagingQuery {
  @ApiProperty({ description: 'Order ID' })
  @IsOptional()
  @IsNumber()
  orderId?: number;
}
