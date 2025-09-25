import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { BoardType } from '../enums';

export class BoardFilterDto {
  @ApiPropertyOptional({ enum: BoardType, description: 'Board type' })
  @IsOptional()
  @IsEnum(BoardType)
  type?: BoardType;

  @ApiPropertyOptional({ description: 'Object ID associated with board' })
  @IsOptional()
  @IsNumber()
  recordId?: number;
}
