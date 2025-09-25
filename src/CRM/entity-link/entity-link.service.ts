import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ObjectState } from '@/common';

import { EntityLinkDto } from './dto';
import { EntityLink } from './entities';

interface FindFilter {
  accountId: number;
  linkId?: number;
  sourceId?: number | number[];
  targetId?: number | number[];
}

@Injectable()
export class EntityLinkService {
  private readonly logger = new Logger(EntityLinkService.name);
  constructor(
    @InjectRepository(EntityLink)
    private readonly repository: Repository<EntityLink>,
  ) {}

  async create({
    accountId,
    sourceId,
    targetId,
    sortOrder,
    createBackLink = true,
  }: {
    accountId: number;
    sourceId: number;
    targetId: number;
    sortOrder?: number;
    createBackLink?: boolean;
  }): Promise<EntityLink> {
    sortOrder ??= (await this.getMaxSortOrder({ accountId, sourceId })) + 1;
    const link = await this.repository.save(new EntityLink(accountId, sourceId, targetId, sortOrder));
    if (createBackLink) {
      await this.create({ accountId, sourceId: targetId, targetId: sourceId, createBackLink: false });
    }
    return link;
  }

  async findOne(filter: FindFilter): Promise<EntityLink | null> {
    return this.createFindQb(filter).getOne();
  }
  async findMany(filter: FindFilter): Promise<EntityLink[]> {
    return this.createFindQb(filter).getMany();
  }

  async processMany({ accountId, links }: { accountId: number; links: EntityLinkDto[] }): Promise<boolean> {
    let changed = false;
    for (const link of links) {
      try {
        if (link.state === ObjectState.Created) {
          await this.create({ accountId, sourceId: link.sourceId, targetId: link.targetId, sortOrder: link.sortOrder });
          changed = true;
        } else if (link.state === ObjectState.Updated) {
          await this.update({ accountId, sourceId: link.sourceId, targetId: link.targetId, sortOrder: link.sortOrder });
        } else if (link.state === ObjectState.Deleted) {
          await this.delete({ accountId, sourceId: link.sourceId, targetId: link.targetId });
          changed = true;
        }
      } catch (error) {
        this.logger.warn(`Failed to process link: ${JSON.stringify(link)}. Error: ${error.toString()}`);
      }
    }
    return changed;
  }

  async update({
    accountId,
    sourceId,
    targetId,
    sortOrder,
  }: {
    accountId: number;
    sourceId: number;
    targetId: number;
    sortOrder: number;
  }) {
    await this.repository.update({ accountId, sourceId, targetId }, { sortOrder });
  }

  async delete({ accountId, sourceId, targetId }: { accountId: number; sourceId: number; targetId: number }) {
    await this.repository.delete({ accountId, sourceId, targetId });
    await this.repository.delete({ accountId, sourceId: targetId, targetId: sourceId });
  }

  async copyEntityLinks({
    accountId,
    sourceId,
    targetId,
  }: {
    accountId: number;
    sourceId: number;
    targetId: number;
  }): Promise<EntityLink[]> {
    const links = await this.findMany({ accountId, sourceId });
    return Promise.all(
      links.map((link) =>
        this.create({ accountId, sourceId: targetId, targetId: link.targetId, sortOrder: link.sortOrder }),
      ),
    );
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('el')
      .where('el.account_id = :accountId', { accountId: filter.accountId })
      .orderBy('el.sort_order', 'ASC');
    if (filter.linkId) {
      qb.andWhere('el.id = :linkId', { linkId: filter.linkId });
    }
    if (filter.sourceId) {
      if (Array.isArray(filter.sourceId)) {
        if (filter.sourceId.length) {
          qb.andWhere('el.source_id IN (:...sourceIds)', { sourceIds: filter.sourceId });
        } else {
          qb.andWhere('1 = 0');
        }
      } else {
        qb.andWhere('el.source_id = :sourceId', { sourceId: filter.sourceId });
      }
    }
    if (filter.targetId) {
      if (Array.isArray(filter.targetId)) {
        if (filter.targetId.length) {
          qb.andWhere('el.target_id IN (:...targetIds)', { targetIds: filter.targetId });
        } else {
          qb.andWhere('1 = 0');
        }
      } else {
        qb.andWhere('el.target_id = :targetId', { targetId: filter.targetId });
      }
    }
    return qb;
  }

  private async getMaxSortOrder({ accountId, sourceId }: { accountId: number; sourceId: number }): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('el')
      .select('max(el.sort_order)', 'max')
      .where('el.account_id = :accountId', { accountId })
      .andWhere('el.source_id = :sourceId', { sourceId })
      .getRawOne<{ max: number }>();
    return result?.max ?? 0;
  }
}
