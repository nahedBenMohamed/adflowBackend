import { Column, Entity, PrimaryColumn } from 'typeorm';

import { DateUtil } from '@/common';

@Entity()
export class ChatPinnedMessage {
  @PrimaryColumn()
  chatId: number;

  @PrimaryColumn()
  messageId: number;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(chatId: number, messageId: number, accountId: number, createdAt?: Date) {
    this.chatId = chatId;
    this.messageId = messageId;
    this.accountId = accountId;
    this.createdAt = createdAt ?? DateUtil.now();
  }
}
