import { Column, Entity, PrimaryColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { ChatMessageStatus } from '../../common/enums/chat-message-status.enum';
import { ChatMessageUserStatusDto } from '../dto/chat-message-user-status.dto';

@Entity()
export class ChatMessageUserStatus {
  @PrimaryColumn()
  chatId: number;

  @PrimaryColumn()
  messageId: number;

  @PrimaryColumn()
  chatUserId: number;

  @Column()
  status: ChatMessageStatus;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(
    accountId: number,
    chatId: number,
    messageId: number,
    chatUserId: number,
    status: ChatMessageStatus,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.chatId = chatId;
    this.messageId = messageId;
    this.chatUserId = chatUserId;
    this.status = status;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public toDto(): ChatMessageUserStatusDto {
    return new ChatMessageUserStatusDto(this.chatUserId, this.status, this.createdAt.toISOString());
  }
}
