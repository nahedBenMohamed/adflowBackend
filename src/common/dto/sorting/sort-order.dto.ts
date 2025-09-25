import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SortOrderDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  sortOrder: number;
}
