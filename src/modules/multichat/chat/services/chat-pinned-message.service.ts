import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatPinnedMessage } from '../entities';

@Injectable()
export class ChatPinnedMessageService {
  constructor(
    @InjectRepository(ChatPinnedMessage)
    private repository: Repository<ChatPinnedMessage>,
  ) {}

  public async pinMessage(accountId: number, chatId: number, messageId: number): Promise<ChatPinnedMessage> {
    return await this.repository.save(new ChatPinnedMessage(chatId, messageId, accountId));
  }

  public async unpinMessage(accountId: number, chatId: number, messageId: number): Promise<void> {
    await this.repository.delete({ chatId, messageId, accountId });
  }
}
