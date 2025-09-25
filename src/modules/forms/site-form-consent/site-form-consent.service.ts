import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { NotFoundError } from '@/common';

import { SiteFormConsent } from './entities';
import type { CreateSiteFormConsentDto, UpdateSiteFormConsentDto } from './dto';

interface FindFilter {
  formId?: number;
}

@Injectable()
export class SiteFormConsentService {
  constructor(
    @InjectRepository(SiteFormConsent)
    private readonly repository: Repository<SiteFormConsent>,
  ) {}

  public async create(accountId: number, formId: number, dto: CreateSiteFormConsentDto): Promise<SiteFormConsent> {
    return this.repository.save(SiteFormConsent.fromDto(accountId, formId, dto));
  }

  public async findOne(accountId: number, filter?: FindFilter): Promise<SiteFormConsent | null> {
    return this.createFindQb(accountId, filter).getOne();
  }

  public async update(accountId: number, formId: number, dto: UpdateSiteFormConsentDto): Promise<SiteFormConsent> {
    const consent = await this.findOne(accountId, { formId });
    if (!consent) {
      throw NotFoundError.withId(SiteFormConsent, formId);
    }

    await this.repository.save(consent.update(dto));

    return consent;
  }

  public async process(
    accountId: number,
    formId: number,
    dto: CreateSiteFormConsentDto | UpdateSiteFormConsentDto,
  ): Promise<SiteFormConsent> {
    const consent = await this.findOne(accountId, { formId });
    if (!consent) {
      return this.create(accountId, formId, dto as CreateSiteFormConsentDto);
    } else {
      await this.repository.save(consent.update(dto as UpdateSiteFormConsentDto));

      return consent;
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
