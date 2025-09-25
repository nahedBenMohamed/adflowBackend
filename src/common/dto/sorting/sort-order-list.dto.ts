import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { SortOrderDto } from './sort-order.dto';

export class SortOrderListDto {
  @ApiProperty({ type: [SortOrderDto] })
  @IsArray()
  items: SortOrderDto[];
}
