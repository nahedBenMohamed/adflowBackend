import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { ActionSendOptionsValue } from './action-send-options-value.dto';
import { ActionSendOptionsEntity } from './action-send-options-entity.dto';

export class ActionSendOptions {
  @ApiPropertyOptional({ description: 'Main entity options', nullable: true, type: ActionSendOptionsValue })
  @IsOptional()
  main?: ActionSendOptionsValue | null;

  @ApiPropertyOptional({
    description: 'Contacts of entity options',
    nullable: true,
    type: ActionSendOptionsEntity,
  })
  @IsOptional()
  contact?: ActionSendOptionsEntity | null;

  @ApiPropertyOptional({
    description: 'Companies of entity options',
    nullable: true,
    type: ActionSendOptionsEntity,
  })
  @IsOptional()
  company?: ActionSendOptionsEntity | null;
}
