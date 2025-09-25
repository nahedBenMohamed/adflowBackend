import { PartialType, PickType } from '@nestjs/swagger';

import { AutomationProcessDto } from './automation-process.dto';

export class UpdateAutomationProcessDto extends PartialType(
  PickType(AutomationProcessDto, ['name', 'type', 'objectId', 'isActive', 'bpmnFile'] as const),
) {}
