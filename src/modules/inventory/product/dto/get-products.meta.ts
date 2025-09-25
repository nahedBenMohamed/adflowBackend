import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GetProductsMeta {
  @ApiProperty()
  @IsNumber()
  totalCount: number;

  constructor(totalCount: number) {
    this.totalCount = totalCount;
  }
}
