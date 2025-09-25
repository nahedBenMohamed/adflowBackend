import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';

import { ActionsSettings } from '../../../common';
import { ChangeStageType } from '../../enums';

export class ActionEntityStageChangeSettings extends ActionsSettings {
  @ApiProperty({ description: 'Stage ID' })
  @IsNumber()
  stageId: number;

  @ApiProperty({ description: 'Type of the operation', enum: ChangeStageType })
  @IsEnum(ChangeStageType)
  operationType: ChangeStageType;
}
