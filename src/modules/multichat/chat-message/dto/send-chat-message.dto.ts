import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class SendChatMessageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  replyToId?: number | number;

  @ApiProperty()
  @IsString()
  text: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsArray()
  fileIds?: string[] | null;
}
