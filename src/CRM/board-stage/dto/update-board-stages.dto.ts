import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

import { UpdateBoardStageDto } from './update-board-stage.dto';

export class UpdateBoardStagesDto {
  @ApiProperty({ type: [UpdateBoardStageDto], description: 'Stage dtos' })
  @IsArray()
  stages: UpdateBoardStageDto[];
}
