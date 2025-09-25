import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class ChatMessagesFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  focusedMessageId?: number | null;
}
