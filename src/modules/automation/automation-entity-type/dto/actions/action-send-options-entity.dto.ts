import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { ActionSendOptionsValue } from './action-send-options-value.dto';

export class ActionSendOptionsEntity extends ActionSendOptionsValue {
  @ApiProperty({ description: 'Use only first entity' })
  @IsOptional()
  @IsBoolean()
  onlyFirstEntity?: boolean | null;
}
