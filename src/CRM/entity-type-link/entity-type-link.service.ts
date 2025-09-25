import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateEntityTypeLinkDto } from './dto';
import { EntityTypeLink } from './entities';

interface FindFilter {
  accountId: number;
  sourceId?: number;
  targetId?: number;
}

@Injectable()
export class EntityTypeLinkService {
  constructor(
    @InjectRepository(EntityTypeLink)
    private repository: Repository<EntityTypeLink>,
  ) {}

  public async create({
    accountId,
    sourceId,
    dto,
    createBackLink = true,
  }: {
    accountId: number;
    sourceId: number;
    dto: CreateEntityTypeLinkDto;
    createBackLink?: boolean;
  }): Promise<EntityTypeLink> {
    dto.sortOrder ??= (await this.getMaxSortOrder({ accountId, sourceId })) + 1;

    const link = await this.repository.save(EntityTypeLink.fromDto(accountId, sourceId, dto));
    if (createBackLink) {
      await this.create({ accountId, sourceId: dto.targetId, dto: { targetId: sourceId }, createBackLink: false });
    }
    return link;
  }

  public async findMany(filter: FindFilter): Promise<EntityTypeLink[]> {
    return this.repository.find({ where: filter, order: { sortOrder: 'ASC' } });
  }

  public async processMany({
    accountId,
    sourceId,
    dtos,
  }: {
    accountId: number;
    sourceId: number;
    dtos: CreateEntityTypeLinkDto[];
  }): Promise<EntityTypeLink[]> {
    const existingLinks = await this.findMany({ accountId, sourceId });

    const deleted = existingLinks.filter((link) => !dtos.some((dto) => dto.targetId === link.targetId));
    if (deleted.length) {
      await this.repository.delete(deleted.map((d) => d.id));
      await Promise.all(
        deleted.map(async (link) => {
          await this.repository.delete({ accountId, sourceId: link.targetId, targetId: sourceId });
        }),
      );
    }

    return Promise.all(
      dtos.map(async (dto) => {
        const existingLink = existingLinks.find((link) => link.targetId === dto.targetId);
        if (existingLink) {
          return this.repository.save(existingLink.update({ sortOrder: dto.sortOrder }));
        } else {
          return this.create({ accountId, sourceId, dto });
        }
      }),
    );
  }

  private async getMaxSortOrder({ accountId, sourceId }: { accountId: number; sourceId: number }): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('etl')
      .select('max(etl.sort_order)', 'max')
      .where('etl.account_id = :accountId', { accountId })
      .andWhere('etl.source_id = :sourceId', { sourceId })
      .getRawOne<{ max: number }>();
    return result?.max ?? 0;
  }
}
