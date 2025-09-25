import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

import { TaskSubtaskDto } from './task-subtask.dto';

export class UpdateTaskSubtaskDto extends PartialType(
  PickType(TaskSubtaskDto, ['text', 'resolved', 'sortOrder'] as const),
) {
  @ApiProperty()
  @IsNumber()
  id: number;
}
