import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VoximplantSipUser } from '../entities';

interface FindFilter {
  sipId?: number;
}

@Injectable()
export class VoximplantSipUserService {
  constructor(
    @InjectRepository(VoximplantSipUser)
    private readonly repository: Repository<VoximplantSipUser>,
  ) {}

  public async create(accountId: number, sipId: number, userIds: number[]): Promise<VoximplantSipUser[]> {
    return await this.repository.save(userIds.map((userId) => new VoximplantSipUser(accountId, sipId, userId)));
  }

  public async findOne(accountId: number, filter?: FindFilter): Promise<VoximplantSipUser | null> {
    return await this.createFindQb(accountId, filter).getOne();
  }
  public async findMany(accountId: number, filter?: FindFilter): Promise<VoximplantSipUser[]> {
    return await this.createFindQb(accountId, filter).getMany();
  }

  public async update(
    accountId: number,
    sipId: number,
    currentUsers: VoximplantSipUser[],
    userIds: number[],
  ): Promise<VoximplantSipUser[]> {
    const addUsers = userIds.filter((id) => !currentUsers.some((user) => user.userId === id));
    const removeUsers = currentUsers.filter((user) => !userIds.some((id) => id === user.userId));

    currentUsers.push(...(await this.create(accountId, sipId, addUsers)));

    if (removeUsers.length) {
      await this.repository.remove(removeUsers);
    }

    return currentUsers.filter((user) => !removeUsers.some((u) => u.userId === user.userId));
  }

  public async removeUser(accountId: number, userId: number) {
    await this.repository.delete({ accountId, userId });
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder('visu').where('visu.account_id = :accountId', { accountId });

    if (filter?.sipId) {
      qb.andWhere('visu.sip_id = :sipId', { sipId: filter.sipId });
    }

    return qb;
  }
}
