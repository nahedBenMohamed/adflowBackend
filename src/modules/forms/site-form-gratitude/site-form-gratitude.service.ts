import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { NotFoundError } from '@/common';

import { SiteFormGratitude } from './entities';
import type { CreateSiteFormGratitudeDto, UpdateSiteFormGratitudeDto } from './dto';

interface FindFilter {
  formId?: number;
}

@Injectable()
export class SiteFormGratitudeService {
  constructor(
    @InjectRepository(SiteFormGratitude)
    private readonly repository: Repository<SiteFormGratitude>,
  ) {}

  public async create(accountId: number, formId: number, dto: CreateSiteFormGratitudeDto): Promise<SiteFormGratitude> {
    return this.repository.save(SiteFormGratitude.fromDto(accountId, formId, dto));
  }

  public async findOne(accountId: number, filter?: FindFilter): Promise<SiteFormGratitude | null> {
    return this.createFindQb(accountId, filter).getOne();
  }

  public async update(accountId: number, formId: number, dto: UpdateSiteFormGratitudeDto): Promise<SiteFormGratitude> {
    const gratitude = await this.findOne(accountId, { formId });
    if (!gratitude) {
      throw NotFoundError.withId(SiteFormGratitude, formId);
    }

    await this.repository.save(gratitude.update(dto));

    return gratitude;
  }

  public async process(
    accountId: number,
    formId: number,
    dto: CreateSiteFormGratitudeDto | UpdateSiteFormGratitudeDto,
  ): Promise<SiteFormGratitude> {
    const gratitude = await this.findOne(accountId, { formId });
    if (!gratitude) {
      return this.create(accountId, formId, dto as CreateSiteFormGratitudeDto);
    } else {
      await this.repository.save(gratitude.update(dto as UpdateSiteFormGratitudeDto));

      return gratitude;
    }
  }

  public async delete(accountId: number, formId: number) {
    await this.createFindQb(accountId, { formId }).delete().execute();
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder().where('account_id = :accountId', { accountId });

    if (filter?.formId) {
      qb.andWhere('form_id = :formId', { formId: filter.formId });
    }

    return qb;
  }
}
