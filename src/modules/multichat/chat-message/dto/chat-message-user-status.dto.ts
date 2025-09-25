import { ApiProperty } from '@nestjs/swagger';

import { ChatMessageStatus } from '../../common/enums/chat-message-status.enum';

export class ChatMessageUserStatusDto {
  @ApiProperty()
  chatUserId: number;

  @ApiProperty()
  status: ChatMessageStatus;

  @ApiProperty()
  createdAt: string;

  constructor(chatUserId: number, status: ChatMessageStatus, createdAt: string) {
    this.chatUserId = chatUserId;
    this.status = status;
    this.createdAt = createdAt;
  }
}
