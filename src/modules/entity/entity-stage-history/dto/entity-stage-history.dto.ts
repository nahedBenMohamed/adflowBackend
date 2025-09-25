import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class EntityStageHistoryDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  entityId: number;

  @ApiProperty()
  @IsNumber()
  boardId: number;

  @ApiProperty()
  @IsNumber()
  stageId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAt?: string;
}
