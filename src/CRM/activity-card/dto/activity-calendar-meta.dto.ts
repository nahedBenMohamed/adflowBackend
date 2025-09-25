import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ActivityCalendarMetaDto {
  @ApiProperty()
  @IsNumber()
  total: number;

  constructor({ total }: ActivityCalendarMetaDto) {
    this.total = total;
  }
}
