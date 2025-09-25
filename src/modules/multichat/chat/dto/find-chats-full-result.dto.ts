import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject } from 'class-validator';

import { PagingMeta } from '@/common';
import { ChatDto } from './chat.dto';

export class FindChatsFullResultDto {
  @ApiProperty({ description: 'List of chats', type: [ChatDto] })
  @IsArray()
  chats: ChatDto[];

  @ApiProperty({ description: 'Chat metadata', type: PagingMeta })
  @IsObject()
  meta: PagingMeta;

  constructor(chats: ChatDto[], meta: PagingMeta) {
    this.chats = chats;
    this.meta = meta;
  }
}
