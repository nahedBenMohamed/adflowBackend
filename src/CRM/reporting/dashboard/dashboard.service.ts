import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';

import {
  DatePeriod,
  DateUtil,
  ForbiddenError,
  intersection,
  NumberUtil,
  PagingMeta,
  PagingQuery,
  QuantityAmountDto,
} from '@/common';

import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities';
import { FieldType } from '@/modules/entity/entity-field/common/enums/field-type.enum';

import { SalesPlanService } from '../../sales-plan/sales-plan.service';
import { BoardStage, BoardStageCodes, BoardStageService } from '../../board-stage';
import { EntityType } from '../../entity-type/entities';
import { Entity } from '../../Model/Entity/Entity';

import { EntityQueryBuilderHelper, SalesPipelineType, SalesPipelineTypes } from '../common';
import {
  DashboardFilterDto,
  SellersRatingReportDto,
  TopSellersReportDto,
  SalesPlanReportDto,
  EntitySummaryReportDto,
  TaskSummaryReportDto,
  SalesPipelineFilterDto,
  SalesPipelineReportDto,
  SalesPipelineReportRowDto,
} from './dto';

interface SalePipelineStageDuration {
  stageId: number;
  duration: number;
}
interface SalePipelineRowData {
  quantity: number;
  amount: number;
}
interface EntityTotalFilter {
  createdAt?: DatePeriod;
  closedAt?: DatePeriod;
  userIds?: number[];
}
interface TaskFilter {
  userIds?: number[] | null;
  period?: DatePeriod | null;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Entity)
    private readonly entityRepository: Repository<Entity>,
    private readonly authService: AuthorizationService,
    @Inject(forwardRef(() => SalesPlanService))
    private readonly salesPlanService: SalesPlanService,
    private readonly stageService: BoardStageService,
  ) {}

  public async getSellersRating({
    accountId,
    user,
    entityTypeId,
    filter,
    paging,
  }: {
    accountId: number;
    user: User;
    entityTypeId: number;
    filter: DashboardFilterDto;
    paging: PagingQuery;
  }): Promise<SellersRatingReportDto> {
    const { allow, userIds } = await this.authService.getPermissions({
      action: 'dashboard',
      user,
      authorizable: EntityType.getAuthorizable(entityTypeId),
    });
    if (!allow) {
      throw new ForbiddenError();
    }

    filter.userIds = filter.userIds?.length ? intersection(filter.userIds, userIds) : userIds;
    const stages = await this.stageService.getGroupedByType({
      accountId,
      entityTypeId,
      boardId: filter.boardIds?.length ? filter.boardIds : undefined,
    });
    if (!stages.won.length) {
      return { users: [], meta: PagingMeta.empty() };
    }

    const closedAt = filter.period ? DatePeriod.fromFilter(filter.period) : undefined;
    const qb = this.createSellersRatingQb();
    EntityQueryBuilderHelper.addConditions(
      qb,
      { accountId, stageIds: stages.won, closedAt, ownerIds: filter.userIds },
      paging,
    );
    const users = await qb.getRawMany();

    const cntQb = this.entityRepository
      .createQueryBuilder('e')
      .select('count(distinct(e.responsible_user_id))', 'cnt')
      .leftJoin('field_value', 'fv', `fv.entity_id = e.id and fv.field_type = 'value'`);
    EntityQueryBuilderHelper.addConditions(cntQb, {
      accountId,
      stageIds: stages.won,
      closedAt,
      ownerIds: filter.userIds,
    });
    const { cnt } = await cntQb.getRawOne();

    return {
      users: users.map((r) => ({
        userId: r.ownerId,
        quantity: NumberUtil.toNumber(r.cnt),
        amount: NumberUtil.toNumber(r.amount),
      })),
      meta: new PagingMeta(paging.skip + paging.take, NumberUtil.toNumber(cnt)),
    };
  }

  public async getTopSellers({
    accountId,
    user,
    entityTypeId,
    filter,
    limit = 5,
  }: {
    accountId: number;
    user: User;
    entityTypeId: number;
    filter: DashboardFilterDto;
    limit?: number;
  }): Promise<TopSellersReportDto> {
    const { allow, userIds } = await this.authService.getPermissions({
      action: 'dashboard',
      user,
      authorizable: EntityType.getAuthorizable(entityTypeId),
    });
    if (!allow) {
      throw new ForbiddenError();
    }

    filter.userIds = filter.userIds?.length ? intersection(filter.userIds, userIds) : userIds;
    const stages = await this.stageService.getGroupedByType({
      accountId,
      entityTypeId,
      boardId: filter.boardIds?.length ? filter.boardIds : undefined,
    });
    if (!stages.won.length) {
      return { users: [], others: QuantityAmountDto.empty(), total: QuantityAmountDto.empty() };
    }

    const closedAt = filter.period ? DatePeriod.fromFilter(filter.period) : undefined;
    const qb = this.createSellersRatingQb();
    EntityQueryBuilderHelper.addConditions(qb, {
      accountId,
      stageIds: stages.won,
      closedAt,
      ownerIds: filter.userIds,
    });
    qb.limit(limit);
    const rawUsers = await qb.getRawMany();
    const users = rawUsers.map((r) => ({
      userId: r.ownerId,
      quantity: NumberUtil.toNumber(r.cnt),
      amount: NumberUtil.toNumber(r.amount),
    }));

    const [totalQuantity, totalAmount] = await this.getEntityTotal(accountId, stages.won, {
      closedAt,
      userIds: filter.userIds,
    });

    const othersQuantity = users.reduce((acc, cur) => acc - cur.quantity, totalQuantity);
    const othersAmount = users.reduce((acc, cur) => acc - cur.amount, totalAmount);

    return {
      users,
      others: new QuantityAmountDto(othersQuantity, othersAmount),
      total: new QuantityAmountDto(totalQuantity, totalAmount),
    };
  }

  public async getSalesPlanSummary({
    accountId,
    user,
    entityTypeId,
    filter,
  }: {
    accountId: number;
    user: User;
    entityTypeId: number;
    filter: DashboardFilterDto;
  }): Promise<SalesPlanReportDto> {
    const { allow, userIds } = await this.authService.getPermissions({
      action: 'dashboard',
      user,
      authorizable: EntityType.getAuthorizable(entityTypeId),
    });
    if (!allow) {
      throw new ForbiddenError();
    }

    filter.userIds = filter.userIds?.length ? intersection(filter.userIds, userIds) : userIds;
    const salesPlans = await this.salesPlanService.getActualPlans(
      accountId,
      entityTypeId,
      filter.userIds,
      filter.period,
    );

    if (salesPlans.length === 0) {
      return {
        amount: { current: 0, plannedToday: 0, plannedTotal: 0 },
        quantity: { current: 0, plannedToday: 0, plannedTotal: 0 },
      };
    }

    const quantityPlanned = salesPlans.reduce((acc, cur) => acc + cur.quantity, 0);
    const amountPlanned = salesPlans.reduce((acc, cur) => acc + cur.amount, 0);

    const { startDate, endDate } = salesPlans[0];

    const planDays = DateUtil.diff({ startDate, endDate, unit: 'day' });
    const todayDays = DateUtil.diff({ startDate, endDate: DateUtil.now(), unit: 'day' });
    const quantityToday = quantityPlanned * (todayDays / planDays);
    const amountToday = amountPlanned * (todayDays / planDays);

    const { quantity, amount } = await this.salesPlanService.getSalesPlanProgress(
      accountId,
      entityTypeId,
      startDate,
      endDate,
      salesPlans.map((sp) => sp.userId),
      filter.boardIds,
    );
    const quantityCurrent = quantity.reduce((acc, cur) => acc + cur.value, 0);
    const amountCurrent = amount.reduce((acc, cur) => acc + cur.value, 0);

    return {
      amount: { current: amountCurrent, plannedToday: amountToday, plannedTotal: amountPlanned },
      quantity: { current: quantityCurrent, plannedToday: quantityToday, plannedTotal: quantityPlanned },
    };
  }

  public async getEntitiesSummary({
    accountId,
    user,
    entityTypeId,
    filter,
  }: {
    accountId: number;
    user: User;
    entityTypeId: number;
    filter: DashboardFilterDto;
  }): Promise<EntitySummaryReportDto> {
    const { allow, userIds } = await this.authService.getPermissions({
      action: 'dashboard',
      user,
      authorizable: EntityType.getAuthorizable(entityTypeId),
    });
    if (!allow) {
      throw new ForbiddenError();
    }

    filter.userIds = filter.userIds?.length ? intersection(filter.userIds, userIds) : userIds;
    const period = filter.period ? DatePeriod.fromFilter(filter.period) : undefined;
    const stages = await this.stageService.getGroupedByType({
      accountId,
      entityTypeId,
      boardId: filter.boardIds?.length ? filter.boardIds : undefined,
    });

    const [totalQuantity, totalAmount] = await this.getEntityTotal(accountId, stages.open, {
      userIds: filter.userIds,
    });
    const [winQuantity, winAmount] = await this.getEntityTotal(accountId, stages.won, {
      closedAt: period,
      userIds: filter.userIds,
    });
    const [lostQuantity, lostAmount] = await this.getEntityTotal(accountId, stages.lost, {
      closedAt: period,
      userIds: filter.userIds,
    });
    const [newQuantity, newAmount] = await this.getEntityTotal(accountId, stages.all, {
      createdAt: period,
      userIds: filter.userIds,
    });

    return {
      total: { quantity: totalQuantity, amount: totalAmount },
      win: { quantity: winQuantity, amount: winAmount },
      lost: { quantity: lostQuantity, amount: lostAmount },
      new: { quantity: newQuantity, amount: newAmount },
    };
  }

  public async getTasksSummary({
    accountId,
    user,
    entityTypeId,
    filter,
  }: {
    accountId: number;
    user: User;
    entityTypeId: number;
    filter: DashboardFilterDto;
  }): Promise<TaskSummaryReportDto> {
    const { allow, userIds } = await this.authService.getPermissions({
      action: 'dashboard',
      user,
      authorizable: EntityType.getAuthorizable(entityTypeId),
    });
    if (!allow) {
      throw new ForbiddenError();
    }

    filter.userIds = filter.userIds?.length ? intersection(filter.userIds, userIds) : userIds;
    const stages = await this.stageService.getGroupedByType({
      accountId,
      entityTypeId,
      boardId: filter.boardIds?.length ? filter.boardIds : undefined,
    });
    if (!stages.all.length) {
      return { total: 0, completed: 0, expired: 0, noTask: 0 };
    }

    const period = filter.period ? DatePeriod.fromFilter(filter.period) : undefined;
    const total = await this.getTasksOrActivityTotal(
      accountId,
      'task',
      stages.all,
      { userIds: filter.userIds },
      { resolved: false },
    );
    const completed = await this.getTasksOrActivityTotal(
      accountId,
      'task',
      stages.all,
      { userIds: filter.userIds, period },
      { resolved: true, dateField: 'resolved_date' },
    );
    const expired = await this.getTasksOrActivityTotal(
      accountId,
      'task',
      stages.all,
      { userIds: filter.userIds },
      { resolved: false, expired: true },
    );
    const noTask = await this.getEntityWithoutTasksCount(accountId, 'task', stages.all, {
      userIds: filter.userIds,
      period,
    });

    return { total, completed, expired, noTask };
  }

  public async getActivitiesSummary({
    accountId,
    user,
    entityTypeId,
    filter,
  }: {
    accountId: number;
    user: User;
    entityTypeId: number;
    filter: DashboardFilterDto;
  }): Promise<TaskSummaryReportDto> {
    const { allow, userIds } = await this.authService.getPermissions({
      action: 'dashboard',
      user,
      authorizable: EntityType.getAuthorizable(entityTypeId),
    });
    if (!allow) {
      throw new ForbiddenError();
    }

    filter.userIds = filter.userIds?.length ? intersection(filter.userIds, userIds) : userIds;
    const stages = await this.stageService.getGroupedByType({
      accountId,
      entityTypeId,
      boardId: filter.boardIds?.length ? filter.boardIds : undefined,
    });
    if (!stages.all.length) {
      return { total: 0, completed: 0, expired: 0, noTask: 0 };
    }

    const period = filter.period ? DatePeriod.fromFilter(filter.period) : undefined;
    const total = await this.getTasksOrActivityTotal(
      accountId,
      'activity',
      stages.all,
      { userIds: filter.userIds },
      { resolved: false },
    );
    const completed = await this.getTasksOrActivityTotal(
      accountId,
      'activity',
      stages.all,
      { userIds: filter.userIds, period },
      { resolved: true, dateField: 'resolved_date' },
    );
    const expired = await this.getTasksOrActivityTotal(
      accountId,
      'activity',
      stages.all,
      { userIds: filter.userIds },
      { resolved: false, expired: true },
    );
    const noTask = await this.getEntityWithoutTasksCount(accountId, 'activity', stages.all, {
      userIds: filter.userIds,
      period,
    });

    return { total, completed, expired, noTask };
  }

  public async getSalesPipeline({
    accountId,
    user,
    entityTypeId,
    filter,
  }: {
    accountId: number;
    user: User;
    entityTypeId: number;
    filter: SalesPipelineFilterDto;
  }): Promise<SalesPipelineReportDto> {
    const { allow, userIds } = await this.authService.getPermissions({
      action: 'dashboard',
      user,
      authorizable: EntityType.getAuthorizable(entityTypeId),
    });
    if (!allow) {
      throw new ForbiddenError();
    }

    filter.userIds = filter.userIds?.length ? intersection(filter.userIds, userIds) : userIds;
    const stages = await this.stageService.findMany({ accountId, boardId: filter.boardId });
    if (stages.length === 0) {
      return { rows: [], totalSales: null, conversionToSale: null, averageAmount: null, averageTerm: null };
    }
    const entityStageIds = this.getSalesPipelineEntityStageIds({ type: filter.type, stages });
    const period = filter.period ? DatePeriod.fromFilter(filter.period) : undefined;
    const durations = await this.getSalesPipelineStageDuration({
      accountId,
      entityTypeId,
      stageIds: stages.map((s) => s.id),
      entityStageIds,
      type: filter.type,
      period,
      userIds: filter.userIds,
    });
    let quantity = 0;
    let isFirstStage = true;
    let totalSales: number | null = null;
    let conversionToSale: number | null = null;
    let averageAmount: number | null = null;
    const rows: SalesPipelineReportRowDto[] = [];
    const rowStages = SalesPipelineTypes.Open.includes(filter.type)
      ? stages.filter((s) => !s.isSystem)
      : stages.filter((s) => !BoardStageCodes.lost.includes(s.code));
    const rowStageIds = rowStages.map((s) => s.id);
    while (rowStages.length > 0) {
      const stageIds = rowStages.map((s) => s.id);
      const data = await this.getSalesPipelineRowData({
        accountId,
        entityTypeId,
        stageIds,
        entityStageIds,
        type: filter.type,
        period,
        userIds: filter.userIds,
      });
      if (isFirstStage) {
        quantity = data.quantity;
        isFirstStage = false;
      }
      const stage = rowStages.shift();
      const duration = durations.find((d) => d.stageId === stage.id)?.duration ?? 0;
      rows.push({
        stageId: stage.id,
        stageName: stage.name,
        stageColor: stage.color,
        stageOrder: stage.sortOrder,
        daysCount: !stage.isSystem ? duration : null,
        percent: quantity ? data.quantity / quantity : 1,
        value: data.amount,
        count: data.quantity,
      });
      if (BoardStageCodes.won.includes(stage.code)) {
        totalSales = data.amount;
        conversionToSale = quantity ? data.quantity / quantity : 1;
        averageAmount = data.quantity ? data.amount / data.quantity : 0;
      }
    }
    let averageTerm: number | null = null;
    if (!SalesPipelineTypes.Open.includes(filter.type)) {
      const lostStages = stages.filter((s) => BoardStageCodes.lost.includes(s.code));
      const stage = lostStages[0];
      const data = await this.getSalesPipelineRowData({
        accountId,
        entityTypeId,
        stageIds: [stage.id],
        entityStageIds,
        type: filter.type,
        period,
        userIds: filter.userIds,
      });
      rows.push({
        stageId: stage.id,
        stageName: stage.name,
        stageColor: stage.color,
        stageOrder: stage.sortOrder,
        daysCount: null,
        percent: quantity ? data.quantity / quantity : 1,
        value: data.amount,
        count: data.quantity,
      });

      const wonStages = stages.filter((s) => BoardStageCodes.won.includes(s.code));
      const wonStage = wonStages[0];
      averageTerm = await this.getSalesPipelineAverageTerm({
        accountId,
        entityTypeId,
        stageIds: rowStageIds,
        entityStageIds: [wonStage.id],
        type: filter.type,
        period,
        userIds: filter.userIds,
      });
    }

    return { totalSales, conversionToSale, averageAmount, averageTerm, rows };
  }

  private async getEntityTotal(
    accountId: number,
    stageIds: number[],
    filter?: EntityTotalFilter,
  ): Promise<[number, number]> {
    if (!stageIds?.length) {
      return [0, 0];
    }

    const qb = this.entityRepository.createQueryBuilder('e').select('count(e.id)', 'cnt');

    EntityQueryBuilderHelper.addConditions(qb, {
      accountId,
      stageIds,
      createdAt: filter?.createdAt,
      closedAt: filter?.closedAt,
      ownerIds: filter?.userIds,
    });

    const { cnt } = await qb.getRawOne();
    const { amount } = await qb
      .clone()
      .select(`sum(cast(fv.payload::json->>'value' as decimal))`, 'amount')
      .innerJoin('field_value', 'fv', `fv.entity_id = e.id and fv.field_type = 'value'`)
      .getRawOne();

    return [NumberUtil.toNumber(cnt), NumberUtil.toNumber(amount)];
  }

  private async getTasksOrActivityTotal(
    accountId: number,
    source: 'task' | 'activity',
    stageIds: number[],
    filter: TaskFilter,
    options?: { resolved?: boolean; expired?: boolean; dateField?: string },
  ): Promise<number> {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('count(s.*)', 'cnt')
      .from(source, 's')
      .innerJoin('entity', 'e', 'e.id = s.entity_id')
      .where('s.account_id = :accountId', { accountId })
      .andWhere('e.stage_id IN (:...stageIds)', { stageIds });

    if (filter.userIds?.length) {
      qb.andWhere('s.responsible_user_id IN (:...userIds)', { userIds: filter.userIds });
    }

    if (filter.period && options?.dateField) {
      if (filter.period.from) {
        qb.andWhere(`s.${options.dateField} >= :from`, { from: filter.period.from });
      }
      if (filter.period.to) {
        qb.andWhere(`s.${options.dateField} <= :to`, { to: filter.period.to });
      }
    }

    if (options?.resolved === true) {
      qb.andWhere('s.is_resolved = true');
    } else if (options?.resolved === false) {
      qb.andWhere('s.is_resolved = false');
    }

    if (options?.expired) {
      qb.andWhere('s.end_date < :now', { now: DateUtil.now() });
    }

    const { cnt } = await qb.getRawOne();

    return NumberUtil.toNumber(cnt);
  }

  private async getEntityWithoutTasksCount(
    accountId: number,
    source: 'task' | 'activity',
    stageIds: number[],
    filter: TaskFilter,
  ): Promise<number> {
    const qb = this.entityRepository
      .createQueryBuilder('e')
      .select('count(distinct(e.id))', 'cnt')
      .leftJoin(source, 's', 's.entity_id = e.id')
      .where('s.id IS NULL');

    EntityQueryBuilderHelper.addConditions(qb, {
      accountId,
      stageIds,
      createdAt: filter.period,
      ownerIds: filter.userIds,
    });

    const { cnt } = await qb.getRawOne();
    return NumberUtil.toNumber(cnt);
  }

  private getSalesPipelineEntityStageIds({
    type,
    stages,
  }: {
    type: SalesPipelineType;
    stages: BoardStage[];
  }): number[] | null {
    if (SalesPipelineTypes.Open.includes(type)) {
      return stages.filter((s) => !s.isSystem).map((s) => s.id);
    } else if (SalesPipelineTypes.Closed.includes(type)) {
      return stages.filter((s) => s.isSystem).map((s) => s.id);
    } else {
      return null;
    }
  }

  private async getSalesPipelineStageDuration({
    accountId,
    entityTypeId,
    stageIds,
    entityStageIds,
    type,
    period,
    userIds,
  }: {
    accountId: number;
    entityTypeId: number;
    stageIds: number[];
    entityStageIds: number[] | null;
    type: SalesPipelineType;
    period: DatePeriod | null | undefined;
    userIds: number[] | null | undefined;
  }): Promise<SalePipelineStageDuration[]> {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('esh.stage_id', 'stage_id')
      .addSelect('esh.entity_id', 'entity_id')
      .addSelect(
        'lead(esh.created_at) over (partition by esh.entity_id order by esh.created_at) - esh.created_at',
        'duration',
      )
      .from('entity_stage_history', 'esh')
      .innerJoin('entity', 'e', 'e.id = esh.entity_id')
      .where(`esh.account_id = ${accountId}`)
      .andWhere(`esh.stage_id in (${stageIds.join(', ')})`)
      .andWhere(`e.entity_type_id = ${entityTypeId}`);
    if (entityStageIds) {
      qb.andWhere(`e.stage_id in (${entityStageIds.join(',')})`);
    }
    if (userIds?.length) {
      qb.andWhere(`e.responsible_user_id in (${userIds.join(',')})`);
    }
    if (period) {
      if (SalesPipelineTypes.Active.includes(type)) {
        if (period.from) {
          qb.andWhere(`esh.created_at >= :eshFrom`, { eshFrom: period.from });
        }
        if (period.to) {
          qb.andWhere(`esh.created_at <= :eshTo`, { eshTo: period.to });
        }
      }
      if (SalesPipelineTypes.All.includes(type)) {
        qb.andWhere(
          new Brackets((qb1) =>
            qb1
              .where('e.closed_at is null')
              .orWhere('e.closed_at > :closedLimit', { closedLimit: period.from || period.to }),
          ),
        );
      } else if (SalesPipelineTypes.Open.includes(type)) {
        qb.andWhere(
          new Brackets((qb1) =>
            qb1
              .where('e.closed_at is null')
              .orWhere('e.closed_at > :closedLimit', { closedLimit: period.to || period.from }),
          ),
        );
      } else if (SalesPipelineTypes.Closed.includes(type)) {
        if (period.from) {
          qb.andWhere(`e.closed_at >= :closedFrom`, { closedFrom: period.from });
        }
        if (period.to) {
          qb.andWhere(`e.closed_at <= :closedTo`, { closedTo: period.to });
        }
      } else if (SalesPipelineTypes.Created.includes(type)) {
        if (period.from) {
          qb.andWhere(`e.created_at >= :createdFrom`, { createdFrom: period.from });
        }
        if (period.to) {
          qb.andWhere(`e.created_at <= :createdTo`, { createdTo: period.to });
        }
      }
    }

    const result = await this.dataSource
      .createQueryBuilder()
      .select('durations.stage_id', 'stage_id')
      .addSelect('avg(extract(epoch from durations.duration))', 'duration')
      .from(`(${qb.getQuery()})`, 'durations')
      .where('durations.duration is not null')
      .groupBy('durations.stage_id')
      .setParameters(qb.getParameters())
      .getRawMany();

    return result.map((r) => ({ stageId: r.stage_id, duration: NumberUtil.toNumber(r.duration) }));
  }

  private async getSalesPipelineRowData({
    accountId,
    entityTypeId,
    stageIds,
    entityStageIds,
    type,
    period,
    userIds,
  }: {
    accountId: number;
    entityTypeId: number;
    stageIds: number[];
    entityStageIds: number[] | null;
    type: SalesPipelineType;
    period: DatePeriod | null | undefined;
    userIds: number[] | null | undefined;
  }): Promise<SalePipelineRowData> {
    const historyQb = this.createSalesPipelineHistoryQb({ accountId, stageIds, type, period });

    const qb = this.entityRepository
      .createQueryBuilder('e')
      .select('count(e.id)::integer', 'quantity')
      .addSelect(`coalesce(sum(cast(fv.payload::json->>'value' as decimal)), 0)::decimal`, 'amount')
      .innerJoin(`(${historyQb.getQuery()})`, 'history', 'history.entity_id = e.id')
      .leftJoin('field_value', 'fv', `fv.entity_id = e.id and fv.field_type = '${FieldType.Value}'`)
      .where('e.account_id = :accountId', { accountId })
      .andWhere('e.entity_type_id = :entityTypeId', { entityTypeId });
    if (entityStageIds) {
      qb.andWhere('e.stage_id in (:...stageIds)', { stageIds: entityStageIds });
    }
    if (userIds?.length) {
      qb.andWhere('e.responsible_user_id in (:...userIds)', { userIds });
    }
    if (period) {
      if (SalesPipelineTypes.All.includes(type)) {
        qb.andWhere(
          new Brackets((qb1) =>
            qb1
              .where('e.closed_at is null')
              .orWhere('e.closed_at > :closedLimit', { closedLimit: period.from || period.to }),
          ),
        );
      } else if (SalesPipelineTypes.Open.includes(type)) {
        qb.andWhere(
          new Brackets((qb1) =>
            qb1
              .where('e.closed_at is null')
              .orWhere('e.closed_at > :closedLimit', { closedLimit: period.to || period.from }),
          ),
        );
      } else if (SalesPipelineTypes.Closed.includes(type)) {
        if (period.from) {
          qb.andWhere(`e.closed_at >= :closedFrom`, { closedFrom: period.from });
        }
        if (period.to) {
          qb.andWhere(`e.closed_at <= :closedTo`, { closedTo: period.to });
        }
      } else if (SalesPipelineTypes.Created.includes(type)) {
        if (period.from) {
          qb.andWhere(`e.created_at >= :createdFrom`, { createdFrom: period.from });
        }
        if (period.to) {
          qb.andWhere(`e.created_at <= :createdTo`, { createdTo: period.to });
        }
      }
    }

    qb.setParameters({ ...historyQb.getParameters(), ...qb.getParameters() });

    const result = await qb.getRawOne();

    return { quantity: result.quantity, amount: NumberUtil.toNumber(result.amount) };
  }

  private async getSalesPipelineAverageTerm({
    accountId,
    entityTypeId,
    stageIds,
    entityStageIds,
    type,
    period,
    userIds,
  }: {
    accountId: number;
    entityTypeId: number;
    stageIds: number[];
    entityStageIds: number[] | null;
    type: SalesPipelineType;
    period: DatePeriod | null | undefined;
    userIds: number[] | null | undefined;
  }): Promise<number> {
    const historyQb = this.createSalesPipelineHistoryQb({ accountId, stageIds, type, period });

    const qb = this.entityRepository
      .createQueryBuilder('e')
      .select('avg(extract(epoch from (e.closed_at - e.created_at)))', 'term')
      .innerJoin(`(${historyQb.getQuery()})`, 'history', 'history.entity_id = e.id')
      .where('e.account_id = :accountId', { accountId })
      .andWhere('e.entity_type_id = :entityTypeId', { entityTypeId });
    if (entityStageIds) {
      qb.andWhere('e.stage_id in (:...stageIds)', { stageIds: entityStageIds });
    }
    if (userIds?.length) {
      qb.andWhere('e.responsible_user_id in (:...userIds)', { userIds });
    }
    if (period) {
      if (SalesPipelineTypes.All.includes(type)) {
        qb.andWhere(
          new Brackets((qb1) =>
            qb1
              .where('e.closed_at is null')
              .orWhere('e.closed_at > :closedLimit', { closedLimit: period.from || period.to }),
          ),
        );
      } else if (SalesPipelineTypes.Open.includes(type)) {
        qb.andWhere(
          new Brackets((qb1) =>
            qb1
              .where('e.closed_at is null')
              .orWhere('e.closed_at > :closedLimit', { closedLimit: period.to || period.from }),
          ),
        );
      } else if (SalesPipelineTypes.Closed.includes(type)) {
        if (period.from) {
          qb.andWhere(`e.closed_at >= :closedFrom`, { closedFrom: period.from });
        }
        if (period.to) {
          qb.andWhere(`e.closed_at <= :closedTo`, { closedTo: period.to });
        }
      } else if (SalesPipelineTypes.Created.includes(type)) {
        if (period.from) {
          qb.andWhere(`e.created_at >= :createdFrom`, { createdFrom: period.from });
        }
        if (period.to) {
          qb.andWhere(`e.created_at <= :createdTo`, { createdTo: period.to });
        }
      }
    }

    qb.setParameters({ ...historyQb.getParameters(), ...qb.getParameters() });

    const result = await qb.getRawOne();

    return NumberUtil.toNumber(result.term);
  }

  private createSalesPipelineHistoryQb({
    accountId,
    stageIds,
    type,
    period,
  }: {
    accountId: number;
    stageIds: number[];
    type: SalesPipelineType;
    period: DatePeriod | null | undefined;
  }) {
    const historyQb = this.dataSource
      .createQueryBuilder()
      .select('distinct esh.entity_id', 'entity_id')
      .from('entity_stage_history', 'esh')
      .where(`esh.account_id = ${accountId}`)
      .andWhere(`esh.stage_id in (${stageIds.join(',')})`);
    if (period && SalesPipelineTypes.Active.includes(type)) {
      if (period.from) {
        historyQb.andWhere(`esh.created_at >= :eshFrom`, { eshFrom: period.from });
      }
      if (period.to) {
        historyQb.andWhere(`esh.created_at <= :eshTo`, { eshTo: period.to });
      }
    }

    return historyQb;
  }

  private createSellersRatingQb() {
    return this.entityRepository
      .createQueryBuilder('e')
      .select('e.responsible_user_id', 'ownerId')
      .addSelect('count(e.id)', 'cnt')
      .addSelect(`sum(cast(fv.payload::json->>'value' as decimal))`, 'amount')
      .leftJoin('field_value', 'fv', `fv.entity_id = e.id and fv.field_type = 'value'`)
      .groupBy('e.responsible_user_id')
      .orderBy('amount', 'DESC', 'NULLS LAST')
      .addOrderBy('cnt', 'DESC', 'NULLS LAST');
  }
}
