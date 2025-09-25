import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { BoardStageDto } from './board-stage.dto';

export class UpdateBoardStageDto extends PartialType(
  PickType(BoardStageDto, ['name', 'color', 'code', 'isSystem', 'sortOrder'] as const),
) {
  @ApiProperty({ description: 'Stage ID' })
  @IsNumber()
  id: number;
}
