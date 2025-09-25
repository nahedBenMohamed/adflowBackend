import { ApiProperty } from '@nestjs/swagger';
import { UserTimeAllocation } from '../BaseTaskBoard/UserTimeAllocation';
import { TimeBoardStageMeta } from './TimeBoardStageMeta';

export class TimeBoardMeta {
  @ApiProperty()
  total: number;

  @ApiProperty({ nullable: true })
  unallocated: TimeBoardStageMeta | null = null;

  @ApiProperty({ nullable: true })
  overdue: TimeBoardStageMeta | null = null;

  @ApiProperty({ nullable: true })
  today: TimeBoardStageMeta | null = null;

  @ApiProperty({ nullable: true })
  tomorrow: TimeBoardStageMeta | null = null;

  @ApiProperty({ nullable: true })
  upcoming: TimeBoardStageMeta | null = null;

  @ApiProperty({ nullable: true })
  resolved: TimeBoardStageMeta | null = null;

  @ApiProperty({ type: [UserTimeAllocation] })
  timeAllocation: UserTimeAllocation[];
}
