import { ApiProperty } from '@nestjs/swagger';

import { UserTimeAllocation } from '../BaseTaskBoard/UserTimeAllocation';

export class TimeBoardStageMeta {
  @ApiProperty()
  total: number;

  @ApiProperty()
  timeAllocation: UserTimeAllocation[];

  constructor(total: number, timeAllocation: UserTimeAllocation[]) {
    this.total = total;
    this.timeAllocation = timeAllocation;
  }
}
