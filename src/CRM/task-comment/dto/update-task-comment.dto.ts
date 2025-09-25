import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateTaskCommentDto {
  @ApiProperty({ description: 'Text of comment' })
  @IsString()
  text: string;
}
