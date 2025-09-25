import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

import { BaseTaskBoardFilter } from '../../Service/BaseTaskBoard/BaseTaskBoardFilter';

export class ActivityCardFilterDto extends BaseTaskBoardFilter {
  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  typeIds?: number[] | null;
}
