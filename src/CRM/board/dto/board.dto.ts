import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { UserRights } from '@/modules/iam/common';

import { BoardType } from '../enums';

export class BoardDto {
  @ApiProperty({ description: 'Board ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Board name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: BoardType, description: 'Board type' })
  @IsEnum(BoardType)
  type: BoardType;

  @ApiProperty({ nullable: true, description: 'Object ID associated with board' })
  @IsOptional()
  @IsNumber()
  recordId: number | null;

  @ApiProperty({ description: 'Indicates if the board is a system board' })
  @IsBoolean()
  isSystem: boolean;

  @ApiProperty({ nullable: true, description: 'Owner ID of the board' })
  @IsOptional()
  @IsNumber()
  ownerId: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Array of participant IDs' })
  @IsOptional()
  @IsNumber({}, { each: true })
  participantIds?: number[] | null;

  @ApiProperty({ description: 'Sort order of the board' })
  @IsNumber()
  sortOrder: number;

  @ApiPropertyOptional({ nullable: true, description: 'Task board ID associated with this board' })
  @IsOptional()
  @IsNumber()
  taskBoardId: number | null;

  @ApiProperty({ type: () => UserRights, nullable: true, description: 'User rights for the board' })
  @IsOptional()
  userRights: UserRights | null;
}
