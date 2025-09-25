import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class OrderFilterDto {
  @ApiProperty()
  @IsNumber()
  entityId: number;
}
