import { PickType } from '@nestjs/swagger';

import { TaskSettingsDto } from './task-settings.dto';

export class CreateTaskSettingsDto extends PickType(TaskSettingsDto, ['type', 'recordId', 'activeFields'] as const) {}
