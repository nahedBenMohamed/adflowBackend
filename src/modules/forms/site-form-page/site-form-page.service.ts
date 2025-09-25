import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { NotFoundError } from '@/common';

import { SiteFormFieldService } from '../site-form-field';

import { SiteFormPage } from './entities';
import type { CreateSiteFormPageDto, UpdateSiteFormPageDto } from './dto';
import type { ExpandableField } from './types';

interface FindFilter {
  formId?: number;
  pageId?: number | number[];
}
interface FindOptions {
  expand?: ExpandableField[];
}

@Injectable()
export class SiteFormPageService {
  constructor(
    @InjectRepository(SiteFormPage)
    private readonly repository: Repository<SiteFormPage>,
    private readonly fieldService: SiteFormFieldService,
  ) {}

  public async create(accountId: number, formId: number, dto: CreateSiteFormPageDto): Promise<SiteFormPage> {
    const page = await this.repository.save(SiteFormPage.fromDto(accountId, formId, dto));

    if (dto.fields) {
      page.fields = await this.fieldService.createMany(accountId, page.id, dto.fields);
    }

    return page;
  }

  public async createMany(accountId: number, formId: number, dtos: CreateSiteFormPageDto[]): Promise<SiteFormPage[]> {
    return Promise.all(dtos.map((dto) => this.create(accountId, formId, dto)));
  }

  public async findOne(accountId: number, filter?: FindFilter, options?: FindOptions): Promise<SiteFormPage | null> {
    const page = await this.createFindQb(accountId, filter).getOne();
    return page && options?.expand ? await this.expandOne(page, options.expand) : page;
  }

  public async findMany(accountId: number, filter?: FindFilter, options?: FindOptions): Promise<SiteFormPage[]> {
    const pages = await this.createFindQb(accountId, filter).orderBy('sort_order').getMany();
    return pages && options?.expand ? await this.expandMany(pages, options.expand) : pages;
  }

  public async update(
    accountId: number,
    formId: number,
    pageId: number,
    dto: UpdateSiteFormPageDto,
  ): Promise<SiteFormPage> {
    const page = await this.findOne(accountId, { formId, pageId });
    if (!page) {
      throw NotFoundError.withId(SiteFormPage, formId);
    }

    await this.repository.save(page.update(dto));

    if (dto.fields) {
      page.fields = await this.fieldService.processBatch(accountId, pageId, dto.fields);
    }

    return page;
  }

  public async updateMany(accountId: number, formId: number, dtos: UpdateSiteFormPageDto[]): Promise<SiteFormPage[]> {
    return Promise.all(dtos.map((dto) => this.update(accountId, formId, dto.id, dto)));
  }

  public async processBatch(
    accountId: number,
    formId: number,
    dtos: (CreateSiteFormPageDto | UpdateSiteFormPageDto)[],
  ): Promise<SiteFormPage[]> {
    const pages = await this.findMany(accountId, { formId });

    const created = dtos.filter((dto) => !dto['id']).map((dto) => dto as CreateSiteFormPageDto);
    const updated = dtos.filter((dto) => dto['id']).map((dto) => dto as UpdateSiteFormPageDto);
    const deleted = pages.filter((f) => !updated.some((dto) => dto.id === f.id)).map((f) => f.id);

    const result: SiteFormPage[] = [];

    result.push(...(await this.createMany(accountId, formId, created)));
    result.push(...(await this.updateMany(accountId, formId, updated)));

    if (deleted.length) {
      await this.delete(accountId, formId, deleted);
    }

    return result;
  }

  public async delete(accountId: number, formId: number, pageId: number | number[]) {
    await this.createFindQb(accountId, { pageId, formId }).delete().execute();
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder().where('account_id = :accountId', { accountId });

    if (filter?.pageId) {
      if (Array.isArray(filter.pageId)) {
        qb.andWhere('id IN (:...ids)', { ids: filter.pageId });
      } else {
        qb.andWhere('id = :id', { id: filter.pageId });
      }
    }

    if (filter?.formId) {
      qb.andWhere('form_id = :formId', { formId: filter.formId });
    }

    return qb;
  }

  private async expandOne(page: SiteFormPage, expand: ExpandableField[]): Promise<SiteFormPage> {
    if (expand.includes('fields')) {
      page.fields = await this.fieldService.findMany(page.accountId, { pageId: page.id });
    }
    return page;
  }
  private async expandMany(pages: SiteFormPage[], expand: ExpandableField[]): Promise<SiteFormPage[]> {
    return await Promise.all(pages.map((page) => this.expandOne(page, expand)));
  }
}
