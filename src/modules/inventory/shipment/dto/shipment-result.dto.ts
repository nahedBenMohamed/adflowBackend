import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

import { PagingMeta } from '@/common';
import { ShipmentDto } from './shipment.dto';

export class ShipmentResultDto {
  @ApiProperty({ type: [ShipmentDto], description: 'List of shipments' })
  @IsArray()
  shipments: ShipmentDto[];

  @ApiProperty({ type: PagingMeta, description: 'Paging metadata' })
  meta: PagingMeta;
}
