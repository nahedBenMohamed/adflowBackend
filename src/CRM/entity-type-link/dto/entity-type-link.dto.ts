import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class EntityTypeLinkDto {
  @ApiProperty({ description: 'Source entity type ID' })
  @IsNumber()
  sourceId: number;

  @ApiProperty({ description: 'Target entity type ID' })
  @IsNumber()
  targetId: number;

  @ApiProperty({ description: 'Sort order' })
  @IsNumber()
  sortOrder: number;
}
