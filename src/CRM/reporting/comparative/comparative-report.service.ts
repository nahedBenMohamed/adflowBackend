import { Injectable } from '@nestjs/common';

import {
  GroupByDate,
  QuantityAmount,
  DatePeriod,
  DateUtil,
  ForbiddenError,
  propagateData,
  intersection,
} from '@/common';
import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { DepartmentService } from '@/modules/iam/department/department.service';
import { User } from '@/modules/iam/user/entities';

import { GroupedStages } from '../../board-stage/types';
import { BoardStageService } from '../../board-stage/board-stage.service';
import { EntityType } from '../../entity-type/entities';

import { ReportRowOwner } from '../common';
import { CrmReportingService } from '../crm-reporting.service';

import { ComparativeReportFilterDto } from './dto';
import { ComparativeReport, ComparativeReportRow, ComparativeReportCell } from './types';

interface Filter {
  type: GroupByDate;
  stages: GroupedStages;
  userIds?: number[] | null;
  period?: DatePeriod | null;
}

@Injectable()
export class ComparativeReportService {
  constructor(
    private readonly authService: AuthorizationService,
    private readonly departmentService: DepartmentService,
    private readonly stageService: BoardStageService,
    private readonly reportingService: CrmReportingService,
  ) {}

  public async getReport({
    accountId,
    user,
    filter,
  }: {
    accountId: number;
    user: User;
    filter: ComparativeReportFilterDto;
  }): Promise<ComparativeReport> {
    const { allow, userIds: allowedUserIds } = await this.authService.getPermissions({
      action: 'report',
      user,
      authorizable: EntityType.getAuthorizable(filter.entityTypeId),
    });
    if (!allow) {
      throw new ForbiddenError();
    }
    const userIds = filter.userIds?.length ? intersection(filter.userIds, allowedUserIds) : allowedUserIds;

    const stages = await this.stageService.getGroupedByType({
      accountId,
      entityTypeId: filter.entityTypeId,
      boardId: filter.boardIds?.length ? filter.boardIds : undefined,
      type: filter.stageType,
    });

    let period = filter.period ? DatePeriod.fromFilter(filter.period) : undefined;
    if (filter.period?.from) {
      switch (filter.type) {
        case GroupByDate.Day:
          period = new DatePeriod(DateUtil.sub(period.from, { weeks: 1 }), period.to);
          break;
        case GroupByDate.Week:
          period = new DatePeriod(DateUtil.sub(period.from, { weeks: 1 }), period.to);
          break;
        case GroupByDate.Month:
          period = new DatePeriod(DateUtil.sub(period.from, { months: 1 }), period.to);
          break;
        case GroupByDate.Quarter:
          period = new DatePeriod(DateUtil.sub(period.from, { months: 3 }), period.to);
          break;
        case GroupByDate.Year:
          period = new DatePeriod(DateUtil.sub(period.from, { years: 1 }), period.to);
          break;
      }
    }

    const [users, departments, total] = await Promise.all([
      this.getGroupBy({
        accountId,
        owner: 'user',
        userOwnerFieldId: filter.ownerFieldId,
        filter: { type: filter.type, stages, userIds, period },
      }),
      this.getGroupBy({
        accountId,
        owner: 'department',
        userOwnerFieldId: filter.ownerFieldId,
        filter: { type: filter.type, stages, userIds, period },
      }),
      this.getGroupBy({
        accountId,
        owner: 'total',
        userOwnerFieldId: filter.ownerFieldId,
        filter: { type: filter.type, stages, userIds, period },
      }),
    ]);

    if (departments.size) {
      const hierarchy = await this.departmentService.getHierarchy({ accountId });

      if (hierarchy.length) {
        propagateData(hierarchy, departments, (ownerId: number) => {
          return ComparativeReport.createEmptyRow(ownerId);
        });
      }
    }

    return new ComparativeReport(users, departments, total.values().next().value);
  }

  private async getGroupBy({
    accountId,
    owner,
    userOwnerFieldId,
    filter,
  }: {
    accountId: number;
    owner: ReportRowOwner;
    userOwnerFieldId: number | undefined;
    filter: Filter;
  }): Promise<Map<number, ComparativeReportRow>> {
    const rowMap = new Map<number, ComparativeReportRow>();

    if (filter.stages?.open?.length) {
      await this.processEntitiesOpen({ accountId, owner, userOwnerFieldId, filter, rowMap });
    }
    if (filter.stages?.lost?.length) {
      await this.processEntitiesLost({ accountId, owner, userOwnerFieldId, filter, rowMap });
    }
    if (filter.stages?.won?.length) {
      await this.processEntitiesWon({ accountId, owner, userOwnerFieldId, filter, rowMap });
    }

    for (const row of rowMap.values()) {
      const newCells: ComparativeReportCell[] = [];
      for (const cell of row.cells.values()) {
        const [prevDate, nextDate] = this.getPrevAndNextDates({ date: cell.date, type: filter.type });
        const prevCell = row.cells.get(prevDate);
        if (prevCell) {
          this.setCellPrevious({ cell, previous: prevCell });
        } else {
          const newCell = ComparativeReportCell.empty(prevDate);
          this.setCellPrevious({ cell, previous: newCell });
        }
        const nextCell = row.cells.get(nextDate);
        if (!nextCell) {
          const newCell = ComparativeReportCell.empty(nextDate);
          this.setCellPrevious({ cell: newCell, previous: cell });
          newCells.push(newCell);
        }
      }
      newCells.forEach((c) => row.cells.set(c.date, c));
    }

    return rowMap;
  }

  private async processEntitiesOpen({
    accountId,
    owner,
    userOwnerFieldId,
    filter,
    rowMap,
  }: {
    accountId: number;
    owner: ReportRowOwner;
    userOwnerFieldId: number | undefined;
    filter: Filter;
    rowMap: Map<number, ComparativeReportRow>;
  }) {
    const result = await this.reportingService.getEntityGroupBy(
      accountId,
      filter.stages.open,
      { owner, userOwnerFieldId, date: { type: filter.type, fieldName: 'created_at' } },
      { amount: true, quantity: true },
      { createdAt: filter.period, userIds: filter.userIds },
    );
    for (const { ownerId, value, date } of result.quantity) {
      const row = rowMap.get(ownerId) ?? ComparativeReportRow.empty(ownerId);
      const cell = row.cells.get(date) ?? ComparativeReportCell.empty(date);
      cell.all.current.quantity += value;
      cell.open.current.quantity = value;
      row.cells.set(date, cell);
      rowMap.set(ownerId, row);
    }
    for (const { ownerId, value, date } of result.amount) {
      const row = rowMap.get(ownerId) ?? ComparativeReportRow.empty(ownerId);
      const cell = row.cells.get(date) ?? ComparativeReportCell.empty(date);
      cell.all.current.amount += value;
      cell.open.current.amount = value;
      row.cells.set(date, cell);
      rowMap.set(ownerId, row);
    }
  }

  private async processEntitiesLost({
    accountId,
    owner,
    userOwnerFieldId,
    filter,
    rowMap,
  }: {
    accountId: number;
    owner: ReportRowOwner;
    userOwnerFieldId: number | undefined;
    filter: Filter;
    rowMap: Map<number, ComparativeReportRow>;
  }) {
    const result = await this.reportingService.getEntityGroupBy(
      accountId,
      filter.stages.lost,
      { owner, userOwnerFieldId, date: { type: filter.type, fieldName: 'closed_at' } },
      { amount: true, quantity: true },
      { closedAt: filter.period, userIds: filter.userIds },
    );
    for (const { ownerId, value, date } of result.quantity) {
      const row = rowMap.get(ownerId) ?? ComparativeReportRow.empty(ownerId);
      const cell = row.cells.get(date) ?? ComparativeReportCell.empty(date);
      cell.all.current.quantity += value;
      cell.lost.current.quantity = value;
      row.cells.set(date, cell);
      rowMap.set(ownerId, row);
    }
    for (const { ownerId, value, date } of result.amount) {
      const row = rowMap.get(ownerId) ?? ComparativeReportRow.empty(ownerId);
      const cell = row.cells.get(date) ?? ComparativeReportCell.empty(date);
      cell.all.current.amount += value;
      cell.lost.current.amount = value;
      row.cells.set(date, cell);
      rowMap.set(ownerId, row);
    }
  }

  private async processEntitiesWon({
    accountId,
    owner,
    userOwnerFieldId,
    filter,
    rowMap,
  }: {
    accountId: number;
    owner: ReportRowOwner;
    userOwnerFieldId: number | undefined;
    filter: Filter;
    rowMap: Map<number, ComparativeReportRow>;
  }) {
    const result = await this.reportingService.getEntityGroupBy(
      accountId,
      filter.stages.won,
      { owner, userOwnerFieldId, date: { type: filter.type, fieldName: 'closed_at' } },
      { amount: true, quantity: true },
      { closedAt: filter.period, userIds: filter.userIds },
    );
    for (const { ownerId, value, date } of result.quantity) {
      const row = rowMap.get(ownerId) ?? ComparativeReportRow.empty(ownerId);
      const cell = row.cells.get(date) ?? ComparativeReportCell.empty(date);
      cell.all.current.quantity += value;
      cell.won.current.quantity = value;
      row.cells.set(date, cell);
      rowMap.set(ownerId, row);
    }
    for (const { ownerId, value, date } of result.amount) {
      const row = rowMap.get(ownerId) ?? ComparativeReportRow.empty(ownerId);
      const cell = row.cells.get(date) ?? ComparativeReportCell.empty(date);
      cell.all.current.amount += value;
      cell.won.current.amount = value;
      row.cells.set(date, cell);
      rowMap.set(ownerId, row);
    }
  }

  private getPrevAndNextDates({ date, type }: { date: string; type: GroupByDate }): [string, string] {
    const current = this.parseDate({ date, type });
    switch (type) {
      case GroupByDate.Day: {
        const prev = DateUtil.format(DateUtil.sub(current, { weeks: 1 }), 'yyyy-MM-dd');
        const next = DateUtil.format(DateUtil.add(current, { weeks: 1 }), 'yyyy-MM-dd');
        return [prev, next];
      }
      case GroupByDate.Week: {
        const prev = DateUtil.format(DateUtil.sub(current, { weeks: 1 }), 'yyyy-ww');
        const next = DateUtil.format(DateUtil.add(current, { weeks: 1 }), 'yyyy-ww');
        return [prev, next];
      }
      case GroupByDate.Month: {
        const prev = DateUtil.format(DateUtil.sub(current, { months: 1 }), 'yyyy-MM');
        const next = DateUtil.format(DateUtil.add(current, { months: 1 }), 'yyyy-MM');
        return [prev, next];
      }
      case GroupByDate.Quarter: {
        const prev = DateUtil.format(DateUtil.sub(current, { months: 3 }), 'yyyy-Q');
        const next = DateUtil.format(DateUtil.add(current, { months: 3 }), 'yyyy-Q');
        return [prev, next];
      }
      case GroupByDate.Year: {
        const prev = DateUtil.format(DateUtil.sub(current, { years: 1 }), 'yyyy');
        const next = DateUtil.format(DateUtil.add(current, { years: 1 }), 'yyyy');
        return [prev, next];
      }
    }
  }

  private parseDate({ date, type }: { date: string; type: GroupByDate }): Date {
    switch (type) {
      case GroupByDate.Day:
        return DateUtil.parse(date, 'yyyy-MM-dd');
      case GroupByDate.Week: {
        const [yearStr, weekStr] = date.split('-');
        const weeks = parseInt(weekStr, 10) - 1;
        return DateUtil.add(DateUtil.parse(yearStr, 'yyyy'), { weeks });
      }
      case GroupByDate.Month:
        return DateUtil.parse(date, 'yyyy-MM');
      case GroupByDate.Quarter:
        return DateUtil.parse(date, 'yyyy-Q');
      case GroupByDate.Year:
        return DateUtil.parse(date, 'yyyy');
    }
  }

  private setCellPrevious({ cell, previous }: { cell: ComparativeReportCell; previous: ComparativeReportCell }) {
    cell.all.previous = new QuantityAmount(previous.all.current.quantity, previous.all.current.amount);
    cell.open.previous = new QuantityAmount(previous.open.current.quantity, previous.open.current.amount);
    cell.lost.previous = new QuantityAmount(previous.lost.current.quantity, previous.lost.current.amount);
    cell.won.previous = new QuantityAmount(previous.won.current.quantity, previous.won.current.amount);

    cell.all.difference = new QuantityAmount(
      this.difference(cell.all.current.quantity, cell.all.previous.quantity),
      this.difference(cell.all.current.amount, cell.all.previous.amount),
    );
    cell.open.difference = new QuantityAmount(
      this.difference(cell.open.current.quantity, cell.open.previous.quantity),
      this.difference(cell.open.current.amount, cell.open.previous.amount),
    );
    cell.lost.difference = new QuantityAmount(
      this.difference(cell.lost.current.quantity, cell.lost.previous.quantity),
      this.difference(cell.lost.current.amount, cell.lost.previous.amount),
    );
    cell.won.difference = new QuantityAmount(
      this.difference(cell.won.current.quantity, cell.won.previous.quantity),
      this.difference(cell.won.current.amount, cell.won.previous.amount),
    );
  }

  private difference(current: number, previous: number): number {
    return previous ? (current - previous) / previous : current ? 1 : 0;
  }
}
