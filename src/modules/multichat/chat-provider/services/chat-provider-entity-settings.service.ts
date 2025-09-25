import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatProviderEntitySettingsDto } from '../dto';
import { ChatProviderEntitySettings } from '../entities';

@Injectable()
export class ChatProviderEntitySettingsService {
  constructor(
    @InjectRepository(ChatProviderEntitySettings)
    private readonly repository: Repository<ChatProviderEntitySettings>,
  ) {}

  async create({
    accountId,
    providerId,
    dto,
  }: {
    accountId: number;
    providerId: number;
    dto: ChatProviderEntitySettingsDto;
  }): Promise<ChatProviderEntitySettings> {
    return this.repository.save(ChatProviderEntitySettings.fromDto({ accountId, providerId, dto }));
  }

  async findOne({
    accountId,
    providerId,
  }: {
    accountId: number;
    providerId: number;
  }): Promise<ChatProviderEntitySettings | null> {
    return this.repository.findOneBy({ accountId, providerId });
  }

  async update({
    accountId,
    providerId,
    dto,
  }: {
    accountId: number;
    providerId: number;
    dto: ChatProviderEntitySettingsDto;
  }): Promise<ChatProviderEntitySettings> {
    const settings = await this.findOne({ accountId, providerId });
    if (settings) {
      await this.repository.save(settings.update(dto));
      return settings;
    } else {
      return this.create({ accountId, providerId, dto });
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

  async delete({ accountId, providerId }: { accountId: number; providerId: number }): Promise<void> {
    await this.repository.delete({ accountId, providerId });
  }
}
