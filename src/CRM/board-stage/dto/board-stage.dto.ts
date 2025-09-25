import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { BoardStageCode } from '../enums';

export class BoardStageDto {
  @ApiProperty({ description: 'Stage ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Board ID' })
  @IsNumber()
  boardId: number;

  @ApiProperty({ description: 'Stage name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Stage color' })
  @IsString()
  color: string;

  @ApiProperty({ enum: BoardStageCode, nullable: true, description: 'Stage code' })
  @IsOptional()
  @IsEnum(BoardStageCode)
  code?: BoardStageCode | null;

  @ApiProperty({ description: 'Is system stage' })
  @IsBoolean()
  isSystem: boolean;

  @ApiProperty({ description: 'Sort order' })
  @IsNumber()
  sortOrder: number;
}
