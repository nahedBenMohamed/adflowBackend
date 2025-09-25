import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

import { FileLinkDto } from '../../Service/FileLink/FileLinkDto';

export class TaskCommentDto {
  @ApiProperty({ description: 'Task comment ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Task ID of comment' })
  @IsNumber()
  taskId: number;

  @ApiProperty({ description: 'User ID of comment' })
  @IsNumber()
  createdBy: number;

  @ApiProperty({ description: 'Text of comment' })
  @IsString()
  text: string;

  @ApiProperty({ type: [FileLinkDto], description: 'Task comment attached file IDs' })
  fileLinks: FileLinkDto[];

  @ApiProperty({ type: [Number], description: 'User IDs who liked the comment' })
  likedUserIds: number[];

  @ApiProperty({ description: 'Date and time when the comment was created in ISO format' })
  @IsString()
  createdAt: string;
}
