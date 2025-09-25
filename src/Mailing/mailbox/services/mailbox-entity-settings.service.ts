import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MailboxEntitySettingsDto } from '../dto';
import { MailboxEntitySettings } from '../entities';

@Injectable()
export class MailboxEntitySettingsService {
  constructor(
    @InjectRepository(MailboxEntitySettings)
    private readonly repository: Repository<MailboxEntitySettings>,
  ) {}

  async create({
    accountId,
    mailboxId,
    dto,
  }: {
    accountId: number;
    mailboxId: number;
    dto: MailboxEntitySettingsDto;
  }): Promise<MailboxEntitySettings> {
    return this.repository.save(MailboxEntitySettings.fromDto({ accountId, mailboxId, dto }));
  }

  async findOne({
    accountId,
    mailboxId,
  }: {
    accountId: number;
    mailboxId: number;
  }): Promise<MailboxEntitySettings | null> {
    return this.repository.findOneBy({ accountId, mailboxId });
  }

  async update({
    accountId,
    mailboxId,
    dto,
  }: {
    accountId: number;
    mailboxId: number;
    dto: MailboxEntitySettingsDto;
  }): Promise<MailboxEntitySettings> {
    const settings = await this.findOne({ accountId, mailboxId });
    if (settings) {
      await this.repository.save(settings.update(dto));
      return settings;
    } else {
      return this.create({ accountId, mailboxId, dto });
    }
  }

  async updateUser({
    accountId,
    userId,
    newUserId,
  }: {
    accountId: number;
    userId: number;
    newUserId?: number | null;
  }): Promise<void> {
    await this.repository.update({ accountId, ownerId: userId }, { ownerId: newUserId ?? null });
  }

  async delete({ accountId, mailboxId }: { accountId: number; mailboxId: number }): Promise<void> {
    await this.repository.delete({ accountId, mailboxId });
  }
}
