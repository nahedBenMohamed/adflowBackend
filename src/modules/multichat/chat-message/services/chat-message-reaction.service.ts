import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatUser } from '../../chat-user';
import { ChatMessageReaction } from '../entities/chat-message-reaction.entity';

@Injectable()
export class ChatMessageReactionService {
  constructor(
    @InjectRepository(ChatMessageReaction)
    private readonly repository: Repository<ChatMessageReaction>,
  ) {}

  public async add(
    accountId: number,
    chatUser: ChatUser,
    messageId: number,
    reaction: string,
  ): Promise<ChatMessageReaction> {
    return await this.repository.save(new ChatMessageReaction(accountId, messageId, chatUser.id, reaction));
  }

  public async remove(accountId: number, chatUser: ChatUser, messageId: number, reactionId: number): Promise<void> {
    await this.repository.delete({ accountId, chatUserId: chatUser.id, messageId, id: reactionId });
  }
}
