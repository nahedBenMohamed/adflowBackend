import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DatePeriod, ForbiddenError, intersection, propagateData, QuantityAmount } from '@/common';
import { AuthorizationService } from '@/modules/iam/authorization';
import { DepartmentService } from '@/modules/iam/department';
import { User } from '@/modules/iam/user/entities';
import { FieldType } from '@/modules/entity/entity-field/common';
import { BoardStageService, GroupedStages } from '@/CRM/board-stage';

import { ScheduleAppointmentStatus } from '../common';
import { Schedule, ScheduleService } from '../schedule';
import { ScheduleAppointment } from '../schedule-appointment';
import { SchedulePerformer, SchedulePerformerType } from '../schedule-performer';

import { ScheduleReportFilterDto } from './dto';
import { ScheduleReportType } from './enums';
import { ScheduleReport, ScheduleReportRow } from './types';

interface ScheduleReportFilter {
  stages: GroupedStages;
  boardIds?: number[];
  period?: DatePeriod;
  userIds?: number[];
  departmentIds?: number[];
}

interface RawReportRow {
  owner_id: number;
  owner_name: string;
  sold_quantity: number;
  sold_amount: number;
  all: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  canceled: number;
}

@Injectable()
export class ScheduleReportingService {
  constructor(
    @InjectRepository(ScheduleAppointment)
    private readonly repository: Repository<ScheduleAppointment>,
    private readonly authService: AuthorizationService,
    private readonly departmentService: DepartmentService,
    private readonly stageService: BoardStageService,
    private readonly scheduleService: ScheduleService,
  ) {}

  public async getReport({
    accountId,
    user,
    filter,
  }: {
    accountId: number;
    user: User;
    filter: ScheduleReportFilterDto;
  }) {
    const { allow, userIds, departmentIds } = await this.authService.getPermissions({
      action: 'report',
      user,
      authorizable: Schedule.getAuthorizable(filter.scheduleId),
    });
    if (!allow) {
      throw new ForbiddenError();
    }

    const { entityTypeId } = await this.scheduleService.findOne({
      filter: { accountId, scheduleId: filter.scheduleId },
    });

    const rowFilter = {
      stages: await this.stageService.getGroupedByType({
        accountId,
        entityTypeId,
        boardId: filter.boardIds?.length ? filter.boardIds : undefined,
      }),
      boardIds: filter.boardIds,
      period: filter.period ? DatePeriod.fromFilter(filter.period) : undefined,
      userIds: filter.userIds?.length ? intersection(filter.userIds, userIds) : userIds,
      departmentIds,
    };
    const rows = await this.getRows({
      accountId,
      scheduleId: filter.scheduleId,
      type: filter.type,
      filter: rowFilter,
      isTotal: false,
    });
    const total = await this.getRows({
      accountId,
      scheduleId: filter.scheduleId,
      type: filter.type,
      filter: rowFilter,
      isTotal: true,
    });

    const report = new ScheduleReport(rows, total.values().next().value);

    if (filter.type === ScheduleReportType.Department && report.rows.size) {
      const hierarchy = await this.departmentService.getHierarchy({ accountId });

      if (hierarchy.length) {
        propagateData(hierarchy, report.rows, ScheduleReportRow.empty);
      }
    }

    return report;
  }

  private async getRows({
    accountId,
    scheduleId,
    type,
    filter,
    isTotal,
  }: {
    accountId: number;
    scheduleId: number;
    type: ScheduleReportType;
    filter: ScheduleReportFilter;
    isTotal: boolean;
  }): Promise<Map<number, ScheduleReportRow>> {
    const rowMap = new Map<number, ScheduleReportRow>();
    const rows = await this.createQb({ accountId, scheduleId, type, filter, isTotal }).getRawMany<RawReportRow>();
    for (const row of rows) {
      rowMap.set(
        row.owner_id,
        new ScheduleReportRow(
          row.owner_id,
          row.owner_name,
          new QuantityAmount(row.sold_quantity, row.sold_amount ? Number(row.sold_amount) : 0),
          row.all,
          row.scheduled,
          row.confirmed,
          row.completed,
          row.canceled,
        ),
      );
    }

    return rowMap;
  }

  private createQb({
    accountId,
    scheduleId,
    type,
    filter,
    isTotal,
  }: {
    accountId: number;
    scheduleId: number;
    type: ScheduleReportType;
    filter: ScheduleReportFilter;
    isTotal: boolean;
  }) {
    const qb = this.repository
      .createQueryBuilder('sa')
      .innerJoin(SchedulePerformer, 'sp', 'sa.performer_id = sp.id')
      .leftJoin('users', 'pu', 'sp.user_id = pu.id')
      .leftJoin('users', 'ou', 'sa.owner_id = ou.id')
      .leftJoin('entity', 'e', 'sa.entity_id = e.id')
      .leftJoin('users', 'eu', 'e.responsible_user_id = eu.id')
      .select(`count(*)::int`, 'all')
      .addSelect(`count(*) filter (where sa.status = '${ScheduleAppointmentStatus.NotConfirmed}')::int`, 'scheduled')
      .addSelect(`count(*) filter (where sa.status = '${ScheduleAppointmentStatus.Confirmed}')::int`, 'confirmed')
      .addSelect(`count(*) filter (where sa.status = '${ScheduleAppointmentStatus.Completed}')::int`, 'completed')
      .addSelect(`count(*) filter (where sa.status = '${ScheduleAppointmentStatus.Canceled}')::int`, 'canceled')
      .where('sa.account_id = :accountId', { accountId })
      .andWhere('sa.schedule_id = :scheduleId', { scheduleId });

    if (isTotal) {
      qb.addSelect('0::int', 'owner_id');
    } else {
      switch (type) {
        case ScheduleReportType.Performer:
          qb.addSelect('sp.user_id', 'owner_id').groupBy('sp.user_id');
          break;
        case ScheduleReportType.Owner:
          qb.addSelect('sa.owner_id', 'owner_id').groupBy('sa.owner_id');
          break;
        case ScheduleReportType.Department:
          qb.addSelect(
            `case when sp.type = '${SchedulePerformerType.Department}' then sp.department_id else pu.department_id end`,
            'owner_id',
          ).groupBy(
            `case when sp.type = '${SchedulePerformerType.Department}' then sp.department_id else pu.department_id end`,
          );
          break;
        case ScheduleReportType.Client:
          qb.addSelect('e.id', 'owner_id').addSelect('e.name', 'owner_name').groupBy('e.id').addGroupBy('e.name');
          break;
      }
    }

    if (filter.stages.won?.length) {
      qb.addSelect(
        `count(*) filter (where e.stage_id = any(array[${filter.stages.won.join(',')}]))::int`,
        'sold_quantity',
      )
        .addSelect(`sum(cast(fv.payload::json->>'value' as decimal))::decimal`, 'sold_amount')
        .leftJoin('field_value', 'fv', `fv.entity_id = e.id and fv.field_type = '${FieldType.Value}'`);
    }

    if (filter.userIds?.length) {
      if (type === ScheduleReportType.Performer) {
        qb.andWhere('sp.user_id IN (:...userIds)', { userIds: filter.userIds });
      } else if (type === ScheduleReportType.Owner) {
        qb.andWhere('sa.owner_id IN (:...userIds)', { userIds: filter.userIds });
      } else if (type === ScheduleReportType.Client) {
        qb.andWhere('e.responsible_user_id IN (:...userIds)', { userIds: filter.userIds });
      }
    }

    if (filter.departmentIds?.length) {
      if (type === ScheduleReportType.Performer) {
        qb.andWhere('pu.department_id IN (:...departmentIds)', { departmentIds: filter.departmentIds });
      } else if (type === ScheduleReportType.Owner) {
        qb.andWhere('ou.department_id IN (:...departmentIds)', { departmentIds: filter.departmentIds });
      } else if (type === ScheduleReportType.Client) {
        qb.andWhere('eu.department_id IN (:...departmentIds)', { departmentIds: filter.departmentIds });
      } else if (type === ScheduleReportType.Department) {
        qb.andWhere(
          // eslint-disable-next-line max-len
          `case when sp.type = '${SchedulePerformerType.Department}' then sp.department_id else pu.department_id end IN (:...departmentIds)`,
          { departmentIds: filter.departmentIds },
        );
      }
    }

    if (filter.period) {
      if (filter.period.from) {
        qb.andWhere('sa.start_date >= :from', { from: filter.period.from });
      }
      if (filter.period.to) {
        qb.andWhere('sa.end_date <= :to', { to: filter.period.to });
      }
    }

    if (filter.boardIds?.length) {
      qb.andWhere('e.board_id IN (:...boardIds)', { boardIds: filter.boardIds });
    }

    return qb;
  }
}
