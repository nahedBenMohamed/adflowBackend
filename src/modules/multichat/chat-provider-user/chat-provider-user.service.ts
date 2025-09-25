import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatProviderUserType } from './enums';
import { ChatProviderUser } from './entities';

interface FindFilter {
  providerId?: number;
  type?: ChatProviderUserType;
}

@Injectable()
export class ChatProviderUserService {
  constructor(
    @InjectRepository(ChatProviderUser)
    private repository: Repository<ChatProviderUser>,
  ) {}

  async create(
    accountId: number,
    providerId: number,
    userIds: number[],
    type: ChatProviderUserType,
  ): Promise<ChatProviderUser[]> {
    return this.repository.save(userIds.map((userId) => new ChatProviderUser(providerId, userId, type, accountId)));
  }

  async findOne(accountId: number, filter?: FindFilter): Promise<ChatProviderUser | null> {
    return this.createFindQb(accountId, filter).getOne();
  }
  async findMany(accountId: number, filter?: FindFilter): Promise<ChatProviderUser[]> {
    return this.createFindQb(accountId, filter).getMany();
  }

  async update(
    accountId: number,
    providerId: number,
    currentUsers: ChatProviderUser[],
    userIds: number[],
    type: ChatProviderUserType,
  ): Promise<ChatProviderUser[]> {
    const addUsers = userIds.filter((id) => !currentUsers.some((user) => user.userId === id));
    const removeUsers = currentUsers.filter((user) => !userIds.some((id) => id === user.userId));

    currentUsers.push(
      ...(await this.repository.save(
        addUsers.map((userId) => new ChatProviderUser(providerId, userId, type, accountId)),
      )),
    );

    if (removeUsers.length > 0) {
      await this.repository.remove(removeUsers);
    }

    return currentUsers.filter((user) => !removeUsers.some((u) => u.userId === user.userId));
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder('cpu').where('cpu.account_id = :accountId', { accountId });

    if (filter?.providerId) {
      qb.andWhere('cpu.provider_id = :providerId', { providerId: filter.providerId });
    }

    if (filter?.type) {
      qb.andWhere('cpu.type = :type', { type: filter.type });
    }

    return qb;
  }
}
