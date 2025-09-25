import { PickType } from '@nestjs/swagger';

import { AutomationProcessDto } from './automation-process.dto';

export class CreateAutomationProcessDto extends PickType(AutomationProcessDto, [
  'name',
  'type',
  'objectId',
  'isActive',
  'bpmnFile',
] as const) {}
