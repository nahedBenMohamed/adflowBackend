import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

import { BoardStageDto } from './board-stage.dto';

export class CreateBoardStageDto extends PickType(BoardStageDto, ['name', 'color', 'code'] as const) {
  @ApiPropertyOptional({ description: 'Stage ID' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Is system' })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
