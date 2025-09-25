import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { UserTimeAllocation } from '../../Service/BaseTaskBoard/UserTimeAllocation';

export class TaskBoardStageMeta {
  @ApiProperty({ description: 'Stage ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Total tasks count' })
  @IsNumber()
  total: number;

  @ApiProperty({ description: 'User time allocation', type: [UserTimeAllocation] })
  timeAllocation: UserTimeAllocation[];
}
