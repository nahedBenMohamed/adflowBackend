import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { NotFoundError } from '@/common';

import { SiteFormField } from './entities';
import { CreateSiteFormFieldDto, UpdateSiteFormFieldDto } from './dto';

interface FindFilter {
  pageId?: number;
  fieldId?: number | number[];
}

@Injectable()
export class SiteFormFieldService {
  constructor(
    @InjectRepository(SiteFormField)
    private readonly repository: Repository<SiteFormField>,
  ) {}

  public async create(accountId: number, pageId: number, dto: CreateSiteFormFieldDto): Promise<SiteFormField> {
    return this.repository.save(SiteFormField.fromDto(accountId, pageId, dto));
  }

  public async createMany(accountId: number, pageId: number, dtos: CreateSiteFormFieldDto[]): Promise<SiteFormField[]> {
    return Promise.all(dtos.map((dto) => this.create(accountId, pageId, dto)));
  }

  public async findOne(accountId: number, filter?: FindFilter): Promise<SiteFormField | null> {
    return this.createFindQb(accountId, filter).getOne();
  }

  public async findMany(accountId: number, filter?: FindFilter): Promise<SiteFormField[]> {
    return this.createFindQb(accountId, filter).orderBy('sort_order').getMany();
  }

  public async update(
    accountId: number,
    pageId: number,
    fieldId: number,
    dto: UpdateSiteFormFieldDto,
  ): Promise<SiteFormField> {
    let field = await this.findOne(accountId, { pageId, fieldId });
    if (!field) {
      throw NotFoundError.withId(SiteFormField, fieldId);
    }

    field = await this.repository.save(field.update(dto));

    return field;
  }

  public async updateMany(accountId: number, pageId: number, dtos: UpdateSiteFormFieldDto[]): Promise<SiteFormField[]> {
    return Promise.all(dtos.map((dto) => this.update(accountId, pageId, dto.id, dto)));
  }

  public async processBatch(
    accountId: number,
    pageId: number,
    dtos: (CreateSiteFormFieldDto | UpdateSiteFormFieldDto)[],
  ): Promise<SiteFormField[]> {
    const fields = await this.findMany(accountId, { pageId });

    const created = dtos.filter((dto) => !dto['id']).map((dto) => dto as CreateSiteFormFieldDto);
    const updated = dtos.filter((dto) => dto['id']).map((dto) => dto as UpdateSiteFormFieldDto);
    const deleted = fields.filter((f) => !updated.some((dto) => dto.id === f.id)).map((f) => f.id);

    const result: SiteFormField[] = [];

    result.push(...(await this.createMany(accountId, pageId, created)));
    result.push(...(await this.updateMany(accountId, pageId, updated)));

    if (deleted.length) {
      await this.delete(accountId, pageId, deleted);
    }

    return result;
  }

  public async delete(accountId: number, pageId: number, fieldId: number | number[]) {
    await this.createFindQb(accountId, { pageId, fieldId }).delete().execute();
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder().where('account_id = :accountId', { accountId });

    if (filter?.fieldId) {
      if (Array.isArray(filter.fieldId)) {
        qb.andWhere('id IN (:...ids)', { ids: filter.fieldId });
      } else {
        qb.andWhere('id = :id', { id: filter.fieldId });
      }
    }

    if (filter?.pageId) {
      qb.andWhere('page_id = :pageId', { pageId: filter.pageId });
    }

    return qb;
  }
}
