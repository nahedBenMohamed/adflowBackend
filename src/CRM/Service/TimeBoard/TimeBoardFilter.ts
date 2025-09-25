import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

import { BaseTaskBoardFilter } from '../../Service/BaseTaskBoard/BaseTaskBoardFilter';
import { TaskGroupByTime } from './TaskGroupByTime';

export class TimeBoardFilter extends BaseTaskBoardFilter {
  @ApiPropertyOptional({ enum: TaskGroupByTime })
  @IsOptional()
  @IsArray()
  groups?: TaskGroupByTime[] | null;
}
