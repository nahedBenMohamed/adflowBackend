import { PickType } from '@nestjs/swagger';

import { TaskSettingsDto } from './task-settings.dto';

export class UpdateTaskSettingsDto extends PickType(TaskSettingsDto, ['activeFields'] as const) {}
