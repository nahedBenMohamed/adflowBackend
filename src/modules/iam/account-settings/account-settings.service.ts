import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateAccountSettingsDto, UpdateAccountSettingsDto } from './dto';
import { AccountSettings } from './entities';

const cacheKey = (accountId: number) => `AccountSettings:${accountId}`;

@Injectable()
export class AccountSettingsService {
  constructor(
    @InjectRepository(AccountSettings)
    private readonly repository: Repository<AccountSettings>,
    private readonly dataSource: DataSource,
  ) {}

  public async create(accountId: number, dto?: CreateAccountSettingsDto): Promise<AccountSettings> {
    this.dataSource.queryResultCache?.remove([cacheKey(accountId)]);
    return this.repository.save(AccountSettings.fromDto(accountId, dto));
  }

  public async getOne(accountId: number): Promise<AccountSettings> {
    const settings = await this.repository.findOne({
      where: { accountId },
      cache: { id: cacheKey(accountId), milliseconds: 86400000 },
    });

    return settings ?? this.create(accountId);
  }

  public async update(accountId: number, dto: UpdateAccountSettingsDto): Promise<AccountSettings> {
    const current = await this.repository.findOneBy({ accountId });
    if (current) {
      this.dataSource.queryResultCache?.remove([cacheKey(accountId)]);
      await this.repository.save(current.update(dto));

      return current;
    } else {
      return this.create(accountId, dto);
    }
  }
}
