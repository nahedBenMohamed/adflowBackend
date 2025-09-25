import { ApiProperty } from '@nestjs/swagger';

export class TimeBoardCalendarMeta {
  @ApiProperty()
  total: number;

  constructor({ total }: TimeBoardCalendarMeta) {
    this.total = total;
  }
}
