import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { ChatMessageReactionDto } from '../dto/chat-message-reaction.dto';

@Entity()
export class ChatMessageReaction {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  messageId: number;

  @Column()
  chatUserId: number;

  @Column()
  reaction: string;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(accountId: number, messageId: number, chatUserId: number, reaction: string, createdAt?: Date) {
    this.accountId = accountId;
    this.messageId = messageId;
    this.chatUserId = chatUserId;
    this.reaction = reaction;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public toDto(): ChatMessageReactionDto {
    return new ChatMessageReactionDto(this.id, this.chatUserId, this.reaction);
  }
}
