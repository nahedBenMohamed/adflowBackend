import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class TaskCommentLikeDto {
  @ApiProperty({ description: 'Task comment ID' })
  @IsNumber()
  commentId: number;

  @ApiProperty({ description: 'User ID who liked the comment' })
  @IsNumber()
  userId: number;
}
