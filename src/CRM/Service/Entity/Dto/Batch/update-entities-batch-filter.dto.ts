import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

import { EntityBoardCardFilter } from '../../../../Controller/Entity/Board/Filter/EntityBoardCardFilter';

export class UpdateEntitiesBatchFilterDto extends EntityBoardCardFilter {
  @ApiPropertyOptional({ type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  entityIds?: number[];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  responsibleUserId?: number | null;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  responsibleEntityTypeIds?: number[] | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  boardId?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  stageId?: number | null;
}
