import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import type { SiteFormEntityTypeDto } from '../dto';
import { SiteFormEntityType } from '../entities';

interface FindFilter {
  formId?: number;
  entityTypeId?: number | number[];
}

@Injectable()
export class SiteFormEntityTypeService {
  constructor(
    @InjectRepository(SiteFormEntityType)
    private readonly repository: Repository<SiteFormEntityType>,
  ) {}

  public async create(accountId: number, formId: number, dto: SiteFormEntityTypeDto): Promise<SiteFormEntityType> {
    return this.repository.save(SiteFormEntityType.fromDto(accountId, formId, dto));
  }

  public async createMany(
    accountId: number,
    formId: number,
    dtos: SiteFormEntityTypeDto[],
  ): Promise<SiteFormEntityType[]> {
    return Promise.all(dtos.map((dto) => this.create(accountId, formId, dto)));
  }

  public async findOne(accountId: number, filter?: FindFilter): Promise<SiteFormEntityType | null> {
    return this.createFindQb(accountId, filter).getOne();
  }

  public async findMany(accountId: number, filter?: FindFilter): Promise<SiteFormEntityType[]> {
    return this.createFindQb(accountId, filter).getMany();
  }

  public async processBatch(
    accountId: number,
    formId: number,
    dtos: SiteFormEntityTypeDto[],
  ): Promise<SiteFormEntityType[]> {
    let links = await this.findMany(accountId, { formId });

    const deleted = links.filter((link) => !dtos.some((dto) => link.entityTypeId === dto.entityTypeId));
    if (deleted.length) {
      await this.delete(accountId, { formId, entityTypeId: deleted.map((link) => link.entityTypeId) });
      links = links.filter((link) => !deleted.some((d) => d.entityTypeId === link.entityTypeId));
    }

    const result: SiteFormEntityType[] = [];
    for (const dto of dtos) {
      const link = links.find((l) => l.entityTypeId === dto.entityTypeId);
      if (link) {
        result.push(await this.repository.save(link.update(dto)));
      } else {
        result.push(await this.create(accountId, formId, dto));
      }
    }
    const created = dtos.filter((dto) => !links.some((link) => link.entityTypeId === dto.entityTypeId));
    if (created.length) {
      result.push(...(await this.createMany(accountId, formId, created)));
    }

    return result;
  }

  public async delete(accountId: number, filter: FindFilter) {
    await this.createFindQb(accountId, filter).delete().execute();
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder().where('account_id = :accountId', { accountId });

    if (filter?.formId) {
      qb.andWhere('form_id = :formId', { formId: filter.formId });
    }

    if (filter?.entityTypeId) {
      if (Array.isArray(filter.entityTypeId)) {
        qb.andWhere('entity_type_id IN (:...entityTypeIds)', { entityTypeIds: filter.entityTypeId });
      } else {
        qb.andWhere('entity_type_id = :entityTypeId', { entityTypeId: filter.entityTypeId });
      }
    }

    return qb;
  }
}
