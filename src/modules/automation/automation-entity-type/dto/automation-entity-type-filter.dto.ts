import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class AutomationEntityTypeFilterDto {
  @ApiPropertyOptional({ description: 'EntityType ID' })
  @IsOptional()
  @IsNumber()
  entityTypeId?: number;

  @ApiPropertyOptional({ description: 'Board ID' })
  @IsOptional()
  @IsNumber()
  boardId?: number;

  @ApiPropertyOptional({ description: 'Stage ID' })
  @IsOptional()
  @IsNumber()
  stageId?: number;

  @ApiPropertyOptional({ description: 'Is the automation active?' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
