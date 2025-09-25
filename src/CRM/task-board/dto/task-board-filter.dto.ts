import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

import { BaseTaskBoardFilter } from '../../Service/BaseTaskBoard/BaseTaskBoardFilter';

export class TaskBoardFilterDto extends BaseTaskBoardFilter {
  @ApiPropertyOptional({ description: 'Stage ids', type: [Number] })
  @IsOptional()
  @IsArray()
  stageIds?: number[] | null;
}
