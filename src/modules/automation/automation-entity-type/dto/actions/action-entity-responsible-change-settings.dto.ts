import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { ActionsSettings } from '../../../common';

export class ActionEntityResponsibleChangeSettings extends ActionsSettings {
  @ApiProperty({ description: 'Responsible user ID, current responsible user ID will be changed to this' })
  @IsNumber()
  responsibleUserId: number;
}
