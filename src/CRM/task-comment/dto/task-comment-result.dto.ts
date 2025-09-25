import { ApiProperty } from '@nestjs/swagger';

import { PagingMeta } from '@/common';
import { TaskCommentDto } from './task-comment.dto';

export class TaskCommentResultDto {
  @ApiProperty({ type: [TaskCommentDto], description: 'Task comment list' })
  result: TaskCommentDto[];

  @ApiProperty({ type: PagingMeta, description: 'Paging meta' })
  meta: PagingMeta;
}
