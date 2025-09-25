import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  NumberFilter,
  PagingQuery,
  DateUtil,
  DatePeriod,
  ForbiddenError,
  propagateData,
  isUnique,
  intersection,
} from '@/common';

import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { AccountSettingsService } from '@/modules/iam/account-settings/account-settings.service';
import { DepartmentService } from '@/modules/iam/department';
import { User } from '@/modules/iam/user/entities/user.entity';
import { EntityInfoService } from '@/modules/entity/entity-info/entity-info.service';
import { EntityType } from '@/CRM/entity-type/entities';

import { CallStatus, CallDirection } from '../common';
import { VoximplantCall } from '../voximplant-call/entities/voximplant-call.entity';

import { CallHistoryReportFilterDto, CallReportFilterDto } from './dto';
import { TelephonyReportType } from './enums';
import { CallHistoryReport, CallReport, CallReportRow } from './types';

interface FindFilter {
  accountId: number;
  status?: CallStatus;
  entityTypeId?: number;
  stageIds?: number[];
  userIds?: number[];
  direction?: CallDirection;
  period?: DatePeriod;
  duration?: NumberFilter;
  numberIds?: number[] | null;
}

enum CallGroupBy {
  None = 'none',
  User = 'user',
  Department = 'department',
}
interface RawReportRow {
  direction: CallDirection;
  owner_id: number;
  quantity: number;
  duration: number;
}

@Injectable()
export class VoximplantReportingService {
  constructor(
    @InjectRepository(VoximplantCall)
    private readonly repository: Repository<VoximplantCall>,
    private readonly authService: AuthorizationService,
    private readonly accountSettingsService: AccountSettingsService,
    private readonly departmentService: DepartmentService,
    private readonly entityInfoService: EntityInfoService,
  ) {}

  public async getCallHistoryReport({
    accountId,
    user,
    filter,
    paging,
  }: {
    accountId: number;
    user: User;
    filter: CallHistoryReportFilterDto;
    paging: PagingQuery;
  }): Promise<CallHistoryReport> {
    let allowedUserIds: number[] | undefined = undefined;
    if (filter.entityTypeId) {
      const { allow, userIds } = await this.authService.getPermissions({
        action: 'report',
        user,
        authorizable: EntityType.getAuthorizable(filter.entityTypeId),
      });
      if (!allow) {
        throw new ForbiddenError();
      }
      allowedUserIds = userIds;
    }

    const qb = this.createFindQb({
      accountId,
      userIds: filter.userIds?.length ? intersection(filter.userIds, allowedUserIds) : allowedUserIds,
      direction: filter.direction,
      period: filter.period ? DatePeriod.fromFilter(filter.period) : undefined,
      duration: filter.duration,
      status: filter.status,
    });

    const calls = await qb.clone().orderBy('call.created_at', 'DESC').offset(paging.skip).limit(paging.take).getMany();

    const entityIds = calls
      .filter((c) => !!c.entityId)
      .map((c) => c.entityId)
      .filter(isUnique);
    const entityInfos = entityIds.length ? await this.entityInfoService.findMany({ accountId, user, entityIds }) : [];
    if (entityInfos.length) {
      calls.forEach((call) => {
        call.entityInfo = entityInfos.find((e) => e.id === call.entityId) ?? null;
      });
    }

    const total = await qb.getCount();

    return new CallHistoryReport({ calls, offset: paging.take + paging.skip, total });
  }

  public async getCallReport({
    accountId,
    user,
    filter,
  }: {
    accountId: number;
    user: User;
    filter: CallReportFilterDto;
  }): Promise<CallReport> {
    let allowedUserIds: number[] | undefined = undefined;
    if (filter.entityTypeId) {
      const { allow, userIds } = await this.authService.getPermissions({
        action: 'report',
        user,
        authorizable: EntityType.getAuthorizable(filter.entityTypeId),
      });
      if (!allow) {
        throw new ForbiddenError();
      }
      allowedUserIds = userIds;
    }

    const reportFilter: FindFilter = {
      accountId,
      //TODO: add EntityTypes and Stages filtering logic
      // entityTypeId: filter.entityTypeId,
      // stageIds: [],
      userIds: filter.userIds?.length ? intersection(filter.userIds, allowedUserIds) : allowedUserIds,
      period: filter.period ? DatePeriod.fromFilter(filter.period) : undefined,
      numberIds: filter.numberIds,
      duration: filter.duration,
    };

    const period = await this.getReportPeriod(reportFilter);

    const users =
      filter.type !== TelephonyReportType.Department
        ? await this.getReportGroupBy({ filter: reportFilter, groupBy: CallGroupBy.User })
        : new Map<number, CallReportRow>();
    const departments =
      filter.type !== TelephonyReportType.Rating
        ? await this.getReportGroupBy({ filter: reportFilter, groupBy: CallGroupBy.Department })
        : new Map<number, CallReportRow>();

    const totalRow = await this.getReportGroupBy({ filter: reportFilter, groupBy: CallGroupBy.None });

    if (departments.size) {
      const hierarchy = await this.departmentService.getHierarchy({ accountId });

      if (hierarchy.length) {
        propagateData(hierarchy, departments, CallReportRow.empty);
      }
    }

    await this.setAverage({ rows: users, period });
    await this.setAverage({ rows: departments, period });
    await this.setAverage({ rows: totalRow, period });

    const total = totalRow.values().next().value ?? CallReportRow.empty(0);
    const report = new CallReport({ users, departments, total });

    return report;
  }

  private async getReportGroupBy({
    filter,
    groupBy,
  }: {
    filter: FindFilter;
    groupBy: CallGroupBy;
  }): Promise<Map<number, CallReportRow>> {
    const rowMap = new Map<number, CallReportRow>();

    const success = await this.getReportRaw({ filter: { ...filter, status: CallStatus.SUCCESS }, groupBy });
    for (const item of success) {
      const row = rowMap.get(item.owner_id) ?? CallReportRow.empty(item.owner_id);
      switch (item.direction) {
        case CallDirection.INCOMING:
          row.call.incoming.quantity = item.quantity;
          row.call.incoming.amount = item.duration;
          break;
        case CallDirection.OUTGOING:
          row.call.outgoing.quantity = item.quantity;
          row.call.outgoing.amount = item.duration;
          break;
      }
      row.call.all.quantity += item.quantity;
      row.call.all.amount += item.duration;
      rowMap.set(item.owner_id, row);
    }

    const missed = await this.getReportRaw({ filter: { ...filter, status: CallStatus.MISSED }, groupBy });
    for (const item of missed) {
      const row = rowMap.get(item.owner_id) ?? CallReportRow.empty(item.owner_id);
      row.call.missed.quantity += item.quantity;
      row.call.missed.amount += item.duration;
      row.call.all.quantity += item.quantity;
      row.call.all.amount += item.duration;
      rowMap.set(item.owner_id, row);
    }

    return rowMap;
  }

  private async getReportRaw({
    filter,
    groupBy,
  }: {
    filter: FindFilter;
    groupBy: CallGroupBy;
  }): Promise<RawReportRow[]> {
    const qb = this.createFindQb(filter)
      .select('call.direction', 'direction')
      .addSelect('count(call.id)::int', 'quantity')
      .addSelect('sum(call.duration)::int', 'duration')
      .groupBy('call.direction');

    switch (groupBy) {
      case CallGroupBy.User:
        qb.addGroupBy('call.user_id').addSelect('call.user_id', 'owner_id');
        break;
      case CallGroupBy.Department:
        qb.leftJoin('users', 'u', 'u.id = call.user_id')
          .addGroupBy('u.department_id')
          .addSelect('COALESCE(u.department_id, 0)', 'owner_id');
        break;
      case CallGroupBy.None:
        qb.addSelect('0', 'owner_id');
        break;
    }

    return qb.getRawMany<RawReportRow>();
  }

  private async getReportPeriod(filter: FindFilter): Promise<number> {
    const qb = this.createFindQb(filter);
    const periodDates = await qb
      .select('min(call.created_at)', 'min_date')
      .addSelect('max(call.created_at)', 'max_date')
      .getRawOne<{ min_date: string; max_date: string }>();

    if (periodDates.min_date && periodDates.max_date) {
      const startDate = new Date(periodDates.min_date);
      const endDate = new Date(periodDates.max_date);

      const { workingDays } = await this.accountSettingsService.getOne(filter.accountId);
      return DateUtil.workingDaysBetween(startDate, endDate, workingDays);
    }

    return 1;
  }

  private async setAverage({ rows, period }: { rows: Map<number, CallReportRow>; period: number }) {
    rows.forEach((value) => {
      value.call.avgAll.quantity = Math.round(value.call.all.quantity / period);
      value.call.avgAll.amount = Math.round(value.call.all.amount / period);
      value.call.avgIncoming.quantity = Math.round(value.call.incoming.quantity / period);
      value.call.avgIncoming.amount = Math.round(value.call.incoming.amount / period);
      value.call.avgOutgoing.quantity = Math.round(value.call.outgoing.quantity / period);
      value.call.avgOutgoing.amount = Math.round(value.call.outgoing.amount / period);
    });
  }

  private createFindQb({
    accountId,
    status,
    entityTypeId,
    stageIds,
    userIds,
    direction,
    period,
    duration,
    numberIds,
  }: FindFilter) {
    const qb = this.repository.createQueryBuilder('call').andWhere('call.account_id = :accountId', { accountId });

    if (status) {
      qb.andWhere('call.status = :status', { status });
    }
    if (entityTypeId || stageIds) {
      qb.leftJoin('entity', 'e', 'e.id = call.entity_id');

      if (entityTypeId) {
        qb.andWhere('e.entity_type_id = :entityTypeId', { entityTypeId });
      }

      if (stageIds?.length) {
        qb.andWhere('call.stage_id IN (:...stageIds)', { stageIds });
      }
    }
    if (userIds?.length) {
      qb.andWhere('call.user_id IN (:...userIds)', { userIds });
    }
    if (direction) {
      qb.andWhere('call.direction = :direction', { direction });
    }
    if (period) {
      if (period.from) {
        qb.andWhere('call.created_at >= :from', { from: period.from });
      }
      if (period.to) {
        qb.andWhere('call.created_at <= :to', { to: period.to });
      }
    }
    if (duration) {
      if (duration.min) {
        qb.andWhere('call.duration >= :min', { min: duration.min });
      }
      if (duration.max) {
        qb.andWhere('call.duration <= :max', { max: duration.max });
      }
    }
    if (numberIds?.length) {
      qb.andWhere('call.number_id IN (:...numberIds)', { numberIds });
    }

    return qb;
  }
}
