import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { UserTimeAllocation } from '../../Service/BaseTaskBoard/UserTimeAllocation';

export class TaskListMeta {
  @ApiProperty({ description: 'Total tasks count' })
  @IsNumber()
  total: number;

  @ApiProperty({ description: 'User time allocation', type: [UserTimeAllocation] })
  timeAllocation: UserTimeAllocation[];
}
