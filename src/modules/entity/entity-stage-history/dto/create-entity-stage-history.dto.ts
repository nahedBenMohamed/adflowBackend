import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { EntityStageHistoryDto } from './entity-stage-history.dto';

export class CreateEntityStageHistoryDto extends PickType(EntityStageHistoryDto, [
  'entityId',
  'boardId',
  'stageId',
  'createdAt',
] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  copiedFrom?: number;
}
