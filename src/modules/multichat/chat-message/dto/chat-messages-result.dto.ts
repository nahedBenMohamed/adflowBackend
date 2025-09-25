import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject } from 'class-validator';

import { PagingMeta } from '@/common';
import { ChatMessageDto } from './chat-message.dto';

export class ChatMessagesResultDto {
  @ApiProperty({ type: [ChatMessageDto] })
  @IsArray()
  messages: ChatMessageDto[];

  @ApiProperty({ type: PagingMeta })
  @IsObject()
  meta: PagingMeta;

  constructor(messages: ChatMessageDto[], meta: PagingMeta) {
    this.messages = messages;
    this.meta = meta;
  }
}
