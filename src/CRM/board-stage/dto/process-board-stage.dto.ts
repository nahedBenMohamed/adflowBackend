import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

import { CreateBoardStageDto } from './create-board-stage.dto';
import { UpdateBoardStageDto } from './update-board-stage.dto';

@ApiExtraModels(CreateBoardStageDto)
@ApiExtraModels(UpdateBoardStageDto)
export class ProcessBoardStageDto {
  @ApiProperty({
    description: 'Array of stages',
    type: 'array',
    items: { oneOf: [{ $ref: getSchemaPath(CreateBoardStageDto) }, { $ref: getSchemaPath(UpdateBoardStageDto) }] },
  })
  @IsOptional()
  @IsArray()
  stages: (CreateBoardStageDto | UpdateBoardStageDto)[];
}
