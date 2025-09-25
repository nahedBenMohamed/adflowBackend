import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class PagingMeta {
  @ApiProperty({ description: 'Offset for pagination' })
  @IsNumber()
  offset: number;

  @ApiProperty({ description: 'Total number of items' })
  @IsNumber()
  total: number;

  constructor(offset: number, total: number) {
    this.offset = Math.min(offset, total);
    this.total = total;
  }

  static empty(): PagingMeta {
    return new PagingMeta(0, 0);
  }
}
