import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { ChatProviderDto } from './chat-provider.dto';

export class CreateChatProviderDto extends PickType(ChatProviderDto, [
  'type',
  'transport',
  'title',
  'status',
  'accessibleUserIds',
  'responsibleUserIds',
  'supervisorUserIds',
  'entitySettings',
] as const) {
  @ApiProperty({ description: 'Messages per day for automated sending' })
  @IsOptional()
  @IsNumber()
  messagePerDay?: number;
}
