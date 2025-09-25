import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateActivityTypeDto, UpdateActivityTypeDto } from './dto';
import { ActivityType } from './entities';
import { NotFoundError } from '@/common';

interface FindFilter {
  accountId: number;
  id?: number | number[];
  name?: string;
}

@Injectable()
export class ActivityTypeService {
  constructor(
    @InjectRepository(ActivityType)
    private readonly repository: Repository<ActivityType>,
  ) {}

  async create({ accountId, dto }: { accountId: number; dto: CreateActivityTypeDto }): Promise<ActivityType> {
    let activityType = await this.findOne({ accountId, name: dto.name });
    if (activityType && activityType.isActive) {
      return activityType;
    }
    if (activityType && !activityType.isActive) {
      activityType.isActive = true;
    } else {
      activityType = new ActivityType(accountId, dto.name);
    }
    return this.repository.save(activityType);
  }

  async findOne(filter: FindFilter): Promise<ActivityType | null> {
    return await this.createFindQb(filter).getOne();
  }
  async findMany(filter: FindFilter): Promise<ActivityType[]> {
    return await this.createFindQb(filter).orderBy('at.created_at', 'ASC').getMany();
  }

  async findManyIds(filter: FindFilter): Promise<number[]> {
    const result = await this.createFindQb(filter).select('at.id', 'id').getRawMany();

    return result.map((r) => r.id);
  }

  async update({
    accountId,
    activityTypeId,
    dto,
  }: {
    accountId: number;
    activityTypeId: number;
    dto: UpdateActivityTypeDto;
  }): Promise<ActivityType> {
    const at = await this.findOne({ accountId, id: activityTypeId });
    if (!at) {
      throw NotFoundError.withId(ActivityType, activityTypeId);
    }

    if (dto.name) {
      at.name = dto.name;
    }

    await this.repository.save(at);

    return at;
  }

  async setActive({
    accountId,
    activityTypeId,
    isActive,
  }: {
    accountId: number;
    activityTypeId: number;
    isActive: boolean;
  }): Promise<void> {
    await this.repository.update({ accountId, id: activityTypeId }, { isActive });
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('at')
      .where('at.account_id = :accountId', { accountId: filter.accountId });

    if (filter?.id) {
      if (Array.isArray(filter.id)) {
        qb.andWhere('at.id IN (:...ids)', { ids: filter.id });
      } else {
        qb.andWhere('at.id = :id', { id: filter.id });
      }
    }

    if (filter?.name) {
      qb.andWhere('at.name = :name', { name: filter.name });
    }

    return qb;
  }
}
