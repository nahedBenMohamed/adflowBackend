import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { ChatMessageScheduledDto } from './chat-message-scheduled.dto';

export class CreateChatMessageScheduledDto extends PickType(ChatMessageScheduledDto, [
  'providerId',
  'sendFrom',
  'message',
  'entityId',
  'phoneNumber',
] as const) {
  @ApiPropertyOptional({ description: 'Send only to first chat' })
  @IsOptional()
  @IsBoolean()
  onlyFirst?: boolean;
}
