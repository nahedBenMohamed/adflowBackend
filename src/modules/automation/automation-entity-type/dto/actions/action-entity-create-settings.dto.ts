import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { ActionsSettings } from '../../../common';

export class ActionEntityCreateSettings extends ActionsSettings {
  @ApiProperty({ description: 'EntityType ID' })
  @IsNumber()
  entityTypeId: number;

  @ApiPropertyOptional({ description: 'Board ID', nullable: true })
  @IsOptional()
  @IsNumber()
  boardId?: number | null;

  @ApiPropertyOptional({ description: 'Stage ID', nullable: true })
  @IsOptional()
  @IsNumber()
  stageId?: number | null;

  @ApiPropertyOptional({ description: 'User ID responsible for the entity', nullable: true })
  @IsOptional()
  @IsNumber()
  ownerId?: number | null;

  @ApiPropertyOptional({ description: 'Name of the entity', nullable: true })
  @IsOptional()
  @IsString()
  name?: string | null;
}
