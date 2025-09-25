import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DatePeriod, DatePeriodDto, DatePeriodFilter, DatePeriodFilterType, DateUtil } from '@/common';

import { IamEventType, UserDeletedEvent } from '@/modules/iam/common';

import { BoardStageService } from '../board-stage';
import { OwnerDateValue } from '../reporting/common';
import { CrmReportingService } from '../reporting/crm-reporting.service';

import { SalesPlanDto, SalesPlanProgressDto } from './dto';
import { SalesPlan } from './entities';

@Injectable()
export class SalesPlanService {
  constructor(
    @InjectRepository(SalesPlan)
    private readonly repository: Repository<SalesPlan>,
    private readonly stageService: BoardStageService,
    @Inject(forwardRef(() => CrmReportingService))
    private readonly reportingService: CrmReportingService,
  ) {}

  @OnEvent(IamEventType.UserDeleted, { async: true })
  public async onUserDeleted(event: UserDeletedEvent) {
    await this.deleteForUser(event.accountId, event.userId);
  }

  public async upsertMany(accountId: number, entityTypeId: number, dtos: SalesPlanDto[]): Promise<SalesPlan[]> {
    return await Promise.all(dtos.map((dto) => this.upsertOne(accountId, entityTypeId, dto)));
  }

  public async upsertOne(accountId: number, entityTypeId: number, dto: SalesPlanDto): Promise<SalesPlan> {
    const period = DatePeriod.fromDto(dto.period);
    const sp = await this.createQb(accountId, { entityTypeId, period, userId: dto.userId }).getOne();

    if (sp) {
      return await this.repository.save(sp.update(dto));
    } else {
      return await this.repository.save(SalesPlan.fromDto(accountId, entityTypeId, dto));
    }
  }

  public async getMany(accountId: number, entityTypeId: number, periodDto: DatePeriodDto): Promise<SalesPlan[]> {
    const period = DatePeriod.fromDto(periodDto);

    return await this.createQb(accountId, { entityTypeId, period }).getMany();
  }

  public async getProgress(
    accountId: number,
    entityTypeId: number,
    periodDto: DatePeriodDto,
  ): Promise<SalesPlanProgressDto[]> {
    const period = DatePeriod.fromDto(periodDto);
    const salesPlans = await this.createQb(accountId, { entityTypeId, period }).getMany();

    if (salesPlans.length === 0) {
      return [];
    }

    const { quantity, amount } = await this.getSalesPlanProgress(
      accountId,
      entityTypeId,
      salesPlans[0].startDate,
      salesPlans[0].endDate,
      salesPlans.map((sp) => sp.userId),
    );

    const result: SalesPlanProgressDto[] = [];
    for (const salePlan of salesPlans) {
      const currentCount = quantity.find((q) => q.ownerId === salePlan.userId)?.value ?? 0;
      const currentAmount = amount.find((a) => a.ownerId === salePlan.userId)?.value ?? 0;
      result.push(
        new SalesPlanProgressDto(salePlan.userId, currentCount, currentAmount, salePlan.quantity, salePlan.amount),
      );
    }

    return result;
  }

  public async getSalesPlanProgress(
    accountId: number,
    entityTypeId: number,
    startDate: Date,
    endDate: Date,
    userIds: number[],
    boardIds?: number[],
  ): Promise<{ quantity: OwnerDateValue[]; amount: OwnerDateValue[] }> {
    const stages = await this.stageService.getGroupedByType({
      accountId,
      entityTypeId,
      boardId: boardIds?.length ? boardIds : undefined,
    });

    return this.reportingService.getEntityGroupBy(
      accountId,
      stages.won,
      { owner: 'user' },
      { amount: true, quantity: true },
      { closedAt: new DatePeriod(startDate, endDate), userIds },
    );
  }

  public async getActualPlans(
    accountId: number,
    entityTypeId: number,
    userIds: number[] | null | undefined,
    period: DatePeriodFilter | null | undefined,
  ): Promise<SalesPlan[]> {
    const dates = period
      ? DatePeriod.fromFilter(period)
      : DatePeriod.fromFilter({ type: DatePeriodFilterType.CurrentMonth });

    const qb = this.repository
      .createQueryBuilder()
      .where('account_id = :accountId', { accountId })
      .andWhere('entity_type_id = :entityTypeId', { entityTypeId });
    if (userIds?.length > 0) {
      qb.andWhere('user_id IN (:...userIds)', { userIds });
    }
    if (dates.from && dates.to) {
      dates.to.setMilliseconds(0);
      // eslint-disable-next-line prettier/prettier
      qb.andWhere('start_date <= :startDate', { startDate: dates.from })
        .andWhere('end_date >= :endDate', { endDate: dates.to });
    } else {
      const now = DateUtil.now();
      // eslint-disable-next-line prettier/prettier
      qb.andWhere('start_date < :startDate', { startDate: now })
        .andWhere('end_date > :endDate', { endDate: now });
    }

    return await qb.getMany();
  }

  public async deleteAll(accountId: number, entityTypeId: number, periodDto: DatePeriodDto): Promise<void> {
    const period = DatePeriod.fromDto(periodDto);
    await this.createQb(accountId, { entityTypeId, period }).delete().execute();
  }

  public async delete(
    accountId: number,
    entityTypeId: number,
    userId: number,
    periodDto: DatePeriodDto,
  ): Promise<void> {
    const period = DatePeriod.fromDto(periodDto);
    await this.createQb(accountId, { entityTypeId, period, userId }).delete().execute();
  }

  private async deleteForUser(accountId: number, userId: number) {
    await this.repository.delete({ accountId, userId });
  }

  private createQb(accountId: number, filter: { entityTypeId: number; period?: DatePeriod; userId?: number }) {
    const qb = this.repository
      .createQueryBuilder()
      .where('account_id = :accountId', { accountId })
      .andWhere('entity_type_id = :entityTypeId', { entityTypeId: filter.entityTypeId });
    if (filter.period?.from) {
      qb.andWhere('start_date >= :startDate', { startDate: filter.period.from });
    }
    if (filter.period?.to) {
      qb.andWhere('end_date <= :endDate', { endDate: filter.period.to });
    }

    if (filter.userId) {
      qb.andWhere('user_id = :userId', { userId: filter.userId });
    }

    return qb;
  }
}
