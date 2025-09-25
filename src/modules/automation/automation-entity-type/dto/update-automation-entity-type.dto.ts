import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { AutomationEntityTypeDto } from './automation-entity-type.dto';

export class UpdateAutomationEntityTypeDto extends PartialType(
  PickType(AutomationEntityTypeDto, [
    'name',
    'entityTypeId',
    'boardId',
    'stageId',
    'isActive',
    'triggers',
    'conditions',
    'actions',
  ] as const),
) {
  @ApiPropertyOptional({ description: 'Apply automation for all entities suitable for conditions' })
  @IsOptional()
  @IsBoolean()
  applyImmediately?: boolean;
}
