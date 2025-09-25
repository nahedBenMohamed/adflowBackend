import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { UserTimeAllocation } from '../../Service/BaseTaskBoard/UserTimeAllocation';
import { TaskBoardStageMeta } from './task-board-stage-meta.dto';

export class TaskBoardMeta {
  @ApiProperty({ description: 'Total tasks count' })
  @IsNumber()
  total: number;

  @ApiProperty({ description: 'Task board stages meta', type: [TaskBoardStageMeta] })
  stages: TaskBoardStageMeta[];

  @ApiProperty({ description: 'User time allocation', type: [UserTimeAllocation] })
  timeAllocation: UserTimeAllocation[];
}
