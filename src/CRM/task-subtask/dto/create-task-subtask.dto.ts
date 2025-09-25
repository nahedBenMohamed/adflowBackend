import { PickType } from '@nestjs/swagger';
import { TaskSubtaskDto } from './task-subtask.dto';

export class CreateTaskSubtaskDto extends PickType(TaskSubtaskDto, ['text', 'resolved', 'sortOrder'] as const) {}
