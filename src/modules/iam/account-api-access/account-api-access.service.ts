import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PasswordUtil } from '@/common';

import { AccountApiAccess } from './entities';

interface FindFilter {
  accountId?: number;
  apiKey?: string;
}

const cacheKey = (key: string) => `AccountApiAccess:${key}`;

@Injectable()
export class AccountApiAccessService {
  constructor(
    @InjectRepository(AccountApiAccess)
    private readonly repository: Repository<AccountApiAccess>,
    private readonly dataSource: DataSource,
  ) {}

  public async create(accountId: number): Promise<AccountApiAccess> {
    return this.repository.save(new AccountApiAccess(accountId, PasswordUtil.generateSecure({ length: 22 })));
  }

  public async recreate(accountId: number): Promise<AccountApiAccess> {
    const access = await this.findOne({ accountId });
    if (access) {
      this.dataSource.queryResultCache?.remove([cacheKey(access.apiKey)]);
      access.apiKey = PasswordUtil.generateSecure({ length: 22 });
      return this.repository.save(access);
    }

    return this.create(accountId);
  }

  public async findOne(filter: FindFilter): Promise<AccountApiAccess> {
    return this.repository.findOne({
      where: { apiKey: filter.apiKey, accountId: filter.accountId },
      cache: filter.apiKey ? { id: cacheKey(filter.apiKey), milliseconds: 86400000 } : undefined,
    });
  }

  public async delete(accountId: number): Promise<void> {
    const access = await this.findOne({ accountId });
    if (access) {
      this.dataSource.queryResultCache?.remove([cacheKey(access.apiKey)]);
      await this.repository.delete({ accountId });
    }
  }
}
