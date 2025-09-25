import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatMessageStatus } from '../../common/enums/chat-message-status.enum';
import { ChatMessageUserStatus } from '../entities/chat-message-user-status.entity';

@Injectable()
export class ChatMessageUserStatusService {
  constructor(
    @InjectRepository(ChatMessageUserStatus)
    private readonly repository: Repository<ChatMessageUserStatus>,
  ) {}

  async setStatus(
    accountId: number,
    chatId: number,
    chatUserId: number,
    messageId: number,
    status: ChatMessageStatus,
  ): Promise<ChatMessageUserStatus> {
    const cmus = new ChatMessageUserStatus(accountId, chatId, messageId, chatUserId, status);
    await this.repository.upsert(cmus, ['chatId', 'messageId', 'chatUserId']);
    return cmus;
  }

  async updateStatusDirect({
    accountId,
    userId,
    chatId,
    status,
  }: {
    accountId: number;
    userId: number;
    chatId?: number;
    status: ChatMessageStatus;
  }) {
    const sql = `
INSERT INTO chat_message_user_status (chat_id, message_id, chat_user_id, status, account_id, created_at)
SELECT cm.chat_id, cm.id, cu.id, '${status}', cm.account_id, NOW()
FROM chat_user cu
JOIN chat_message cm ON cm.chat_id = cu.chat_id
WHERE cu.account_id = ${accountId}
  AND cu.user_id = ${userId}
  AND ${chatId ? `cu.chat_id = ${chatId}` : 'TRUE'}
ON CONFLICT (chat_id, message_id, chat_user_id)
  DO UPDATE SET status = EXCLUDED.status, created_at = NOW()
  WHERE chat_message_user_status.status IS DISTINCT FROM EXCLUDED.status;
    `;

    await this.repository.query(sql);
  }
}
