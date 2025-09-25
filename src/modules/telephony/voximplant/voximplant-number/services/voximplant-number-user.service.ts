import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VoximplantNumberUser } from '../entities';

interface FindFilter {
  numberId?: number;
}

@Injectable()
export class VoximplantNumberUserService {
  constructor(
    @InjectRepository(VoximplantNumberUser)
    private readonly repository: Repository<VoximplantNumberUser>,
  ) {}

  public async create(accountId: number, numberId: number, userIds: number[]): Promise<VoximplantNumberUser[]> {
    return await this.repository.save(userIds.map((userId) => new VoximplantNumberUser(accountId, numberId, userId)));
  }

  public async findOne(accountId: number, filter?: FindFilter): Promise<VoximplantNumberUser | null> {
    return await this.createFindQb(accountId, filter).getOne();
  }
  public async findMany(accountId: number, filter?: FindFilter): Promise<VoximplantNumberUser[]> {
    return await this.createFindQb(accountId, filter).getMany();
  }

  public async update(
    accountId: number,
    numberId: number,
    currentUsers: VoximplantNumberUser[],
    userIds: number[],
  ): Promise<VoximplantNumberUser[]> {
    const addUsers = userIds.filter((id) => !currentUsers.some((user) => user.userId === id));
    const removeUsers = currentUsers.filter((user) => !userIds.some((id) => id === user.userId));

    currentUsers.push(...(await this.create(accountId, numberId, addUsers)));

    if (removeUsers.length) {
      await this.repository.remove(removeUsers);
    }

    return currentUsers.filter((user) => !removeUsers.some((u) => u.userId === user.userId));
  }

  public async removeUser(accountId: number, userId: number) {
    await this.repository.delete({ accountId, userId });
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder('vinu').where('vinu.account_id = :accountId', { accountId });

    if (filter?.numberId) {
      qb.andWhere('vinu.number_id = :numberId', { numberId: filter.numberId });
    }

    return qb;
  }
}
