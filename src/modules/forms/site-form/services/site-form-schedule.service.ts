import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import type { SiteFormScheduleDto } from '../dto';
import { SiteFormSchedule } from '../entities';

interface FindFilter {
  formId?: number;
  scheduleId?: number | number[];
}

@Injectable()
export class SiteFormScheduleService {
  constructor(
    @InjectRepository(SiteFormSchedule)
    private readonly repository: Repository<SiteFormSchedule>,
  ) {}

  public async create(accountId: number, formId: number, dto: SiteFormScheduleDto): Promise<SiteFormSchedule> {
    return this.repository.save(SiteFormSchedule.fromDto(accountId, formId, dto));
  }

  public async createMany(accountId: number, formId: number, dtos: SiteFormScheduleDto[]): Promise<SiteFormSchedule[]> {
    return Promise.all(dtos.map((dto) => this.create(accountId, formId, dto)));
  }

  public async findOne(accountId: number, filter?: FindFilter): Promise<SiteFormSchedule | null> {
    return this.createFindQb(accountId, filter).getOne();
  }

  public async findMany(accountId: number, filter?: FindFilter): Promise<SiteFormSchedule[]> {
    return this.createFindQb(accountId, filter).getMany();
  }

  public async processBatch(
    accountId: number,
    formId: number,
    dtos: SiteFormScheduleDto[],
  ): Promise<SiteFormSchedule[]> {
    let links = await this.findMany(accountId, { formId });

    const deleted = links.filter((link) => !dtos.some((dto) => link.scheduleId === dto.scheduleId));
    if (deleted.length) {
      await this.delete(accountId, { formId, scheduleId: deleted.map((link) => link.scheduleId) });
      links = links.filter((link) => !deleted.some((d) => d.scheduleId === link.scheduleId));
    }

    const result: SiteFormSchedule[] = [];
    for (const dto of dtos) {
      const link = links.find((l) => l.scheduleId === dto.scheduleId);
      if (link) {
        result.push(await this.repository.save(link.update(dto)));
      } else {
        result.push(await this.create(accountId, formId, dto));
      }
    }
    const created = dtos.filter((dto) => !links.some((link) => link.scheduleId === dto.scheduleId));
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

    if (filter?.scheduleId) {
      if (Array.isArray(filter.scheduleId)) {
        qb.andWhere('schedule_id IN (:...scheduleIds)', { scheduleIds: filter.scheduleId });
      } else {
        qb.andWhere('schedule_id = :scheduleId', { scheduleId: filter.scheduleId });
      }
    }

    return qb;
  }
}
