import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { BoardDto } from './board.dto';

export class CreateBoardDto extends PickType(BoardDto, ['name', 'type', 'recordId', 'participantIds'] as const) {
  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
