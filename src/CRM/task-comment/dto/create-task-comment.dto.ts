import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateTaskCommentDto {
  @ApiProperty({ description: 'Text of comment' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ type: [String], nullable: true, description: 'Task comment attached file IDs' })
  @IsOptional()
  @IsArray()
  fileIds: string[] | null;
}
