import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { MailMessageAttachment, MailMessagePayloadExternal } from '../common';
import { MailProviderRegistry } from '../mail-provider';
import { Mailbox } from '../mailbox';
import { MailMessage } from '../Model/MailMessage/MailMessage';

import { MailMessagePayload } from './entities';

@Injectable()
export class MailMessagePayloadService {
  constructor(
    @InjectRepository(MailMessagePayload)
    private readonly repository: Repository<MailMessagePayload>,
    private readonly mailProviderRegistry: MailProviderRegistry,
  ) {}

  async findByMessageId(accountId: number, messageId: number): Promise<MailMessagePayload[]> {
    return this.repository.findBy({ accountId, messageId });
  }

  async findByMessageIds(accountId: number, messageIds: number[]): Promise<MailMessagePayload[]> {
    return this.repository.findBy({ accountId, messageId: In(messageIds) });
  }

  async getAttachment(
    accountId: number,
    mailbox: Mailbox,
    message: MailMessage,
    payloadId: number,
  ): Promise<MailMessageAttachment | null> {
    const payload = await this.repository.findOneBy({ accountId, messageId: message.id, id: payloadId });
    if (payload) {
      const provider = this.mailProviderRegistry.get(mailbox.provider);
      return provider.getAttachment({ mailbox, message, payload });
    }

    return null;
  }

  async processExternalPayloads(accountId: number, messageId: number, payloads: MailMessagePayloadExternal[]) {
    let sortOrder = 0;
    for (const payload of payloads) {
      await this.repository.insert(MailMessagePayload.fromExternal(accountId, messageId, sortOrder, payload));
      ++sortOrder;
    }
  }
}
