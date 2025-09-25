import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

import { EntityBoardCardFilter } from '../../../../Controller/Entity/Board/Filter/EntityBoardCardFilter';

export class DeleteEntitiesBatchFilterDto extends EntityBoardCardFilter {
  @ApiPropertyOptional({ type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  entityIds?: number[];
}
