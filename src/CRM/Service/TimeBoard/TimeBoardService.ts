import { Injectable, Logger } from '@nestjs/common';
import { Brackets, DataSource, SelectQueryBuilder } from 'typeorm';

import { DatePeriod, DatePeriodDto, DateUtil, ForbiddenError, intersection, isUnique, PagingQuery } from '@/common';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { EntityInfoDto, EntityInfoService } from '@/modules/entity/entity-info';

import { Activity } from '../../activity';
import { ActivityCardDto, ActivityCardService } from '../../activity-card';
import { TaskView } from '../../base-task';
import { BoardService } from '../../board/board.service';
import { Task } from '../../task';
import { TaskBoardCardDto, TaskBoardService } from '../../task-board';

import { TaskBoardQueryHelper } from '../BaseTaskBoard/TaskBoardQueryHelper';
import { TaskSorting } from '../BaseTaskBoard/TaskSorting';
import { UserTimeAllocation } from '../BaseTaskBoard/UserTimeAllocation';
import { TimeBoardFilter } from './TimeBoardFilter';
import { TimeBoardMeta } from './TimeBoardMeta';
import { TaskOrActivityCard } from './TaskOrActivityCard';
import { TimeBoardStageMeta } from './TimeBoardStageMeta';
import { TimeBoardCalendarMeta } from './TimeBoardCalendarMeta';
import { TaskGroupByTime } from './TaskGroupByTime';

@Injectable()
export class TimeBoardService {
  private readonly logger = new Logger(TimeBoardService.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly authService: AuthorizationService,
    private readonly activityCardService: ActivityCardService,
    private readonly taskBoardService: TaskBoardService,
    private readonly boardService: BoardService,
    private readonly entityInfoService: EntityInfoService,
  ) {}

  public async getTimeBoardCards(
    account: Account,
    user: User,
    filter: TimeBoardFilter,
    paging: PagingQuery,
  ): Promise<TaskOrActivityCard[]> {
    const activityPerm = await this.authService.getPermissions({
      action: 'view',
      user,
      authorizable: Activity.getAuthorizable(),
    });
    const taskPerm = await this.authService.getPermissions({
      action: 'view',
      user,
      authorizable: Task.getAuthorizable(),
    });
    if (!activityPerm.allow && !taskPerm.allow) {
      throw new ForbiddenError();
    }

    const allowedBoardIds = await this.boardService.getAllowedTaskBoardIds({ accountId: account.id, userId: user.id });

    const allowedTypes = [];
    if (activityPerm.allow) {
      allowedTypes.push(TaskView.Activity);
    }
    if (taskPerm.allow) {
      allowedTypes.push(TaskView.Task);
    }

    const activityUsers = intersection(filter.ownerIds, activityPerm.userIds);
    const taskUsers = intersection(filter.ownerIds, taskPerm.userIds);

    const now = DateUtil.now();
    const tasks = [];
    const qb = this.createQueryBuilder(
      account.id,
      user.id,
      allowedBoardIds,
      allowedTypes,
      activityUsers,
      taskUsers,
      filter,
    );
    if (!filter.groups || filter.groups.includes(TaskGroupByTime.Unallocated)) {
      const unallocatedQb = qb
        .clone()
        .andWhere('at.is_resolved = false')
        .andWhere('at.start_date is null')
        .andWhere('at.end_date is null');

      tasks.push(...(await this.getTasks(unallocatedQb.clone(), filter.sorting, paging)));
    }
    if (!filter.groups || filter.groups.includes(TaskGroupByTime.Overdue)) {
      const expiredQb = qb
        .clone()
        .andWhere('at.is_resolved = false')
        .andWhere(
          new Brackets((qbE) => {
            qbE.where('at.end_date < :now', { now }).orWhere('at.end_date is null AND at.start_date < :now', { now });
          }),
        );

      tasks.push(...(await this.getTasks(expiredQb.clone(), filter.sorting, paging)));
    }
    if (!filter.groups || filter.groups.includes(TaskGroupByTime.Today)) {
      const endOfTheDay = DateUtil.endOf(now, 'day');
      const todayQb = qb
        .clone()
        .andWhere('at.is_resolved = false')
        .andWhere(
          new Brackets((qbT) => {
            qbT
              .where('at.start_date <= :endOfTheDay AND at.end_date > :now', { endOfTheDay, now })
              .orWhere('at.end_date is null AND at.start_date >= :now AND at.start_date <= :endOfTheDay', {
                endOfTheDay,
                now,
              })
              .orWhere('at.start_date is null AND at.end_date >= :now AND at.end_date <= :endOfTheDay', {
                endOfTheDay,
                now,
              });
          }),
        );

      tasks.push(...(await this.getTasks(todayQb.clone(), filter.sorting, paging)));
    }
    if (!filter.groups || filter.groups.includes(TaskGroupByTime.Tomorrow)) {
      const tomorrowStart = DateUtil.add(DateUtil.startOf(now, 'day'), { days: 1 });
      const tomorrowEnd = DateUtil.add(DateUtil.endOf(now, 'day'), { days: 1 });
      const tomorrowQb = qb
        .clone()
        .andWhere('at.is_resolved = false')
        .andWhere(
          new Brackets((qbTm) => {
            qbTm
              .where('at.start_date >= :tomorrowStart AND at.start_date <= :tomorrowEnd', {
                tomorrowStart,
                tomorrowEnd,
              })
              .orWhere('at.start_date is null AND at.end_date >= :tomorrowStart AND at.end_date <= :tomorrowEnd', {
                tomorrowStart,
                tomorrowEnd,
              });
          }),
        );

      tasks.push(...(await this.getTasks(tomorrowQb.clone(), filter.sorting, paging)));
    }
    if (!filter.groups || filter.groups.includes(TaskGroupByTime.Upcoming)) {
      const tomorrowEnd = DateUtil.add(DateUtil.startOf(now, 'day'), { days: 2 });
      const upcomingQb = qb
        .clone()
        .andWhere('at.is_resolved = false')
        .andWhere(
          new Brackets((qbU) => {
            qbU
              .where('at.start_date > :tomorrowEnd', { tomorrowEnd })
              .orWhere('at.start_date is null AND at.end_date > :tomorrowEnd', { tomorrowEnd });
          }),
        );

      tasks.push(...(await this.getTasks(upcomingQb.clone(), filter.sorting, paging)));
    }
    if ((!filter.groups && filter.showResolved !== false) || filter.groups?.includes(TaskGroupByTime.Resolved)) {
      const resolvedQb = qb.clone().andWhere('at.is_resolved = true');

      tasks.push(...(await this.getTasks(resolvedQb.clone(), filter.sorting, paging)));
    }

    return this.createItemsFromRaw(account, user, tasks);
  }

  public async getTimeBoardMeta(accountId: number, user: User, filter: TimeBoardFilter): Promise<TimeBoardMeta> {
    const activityPerm = await this.authService.getPermissions({
      action: 'view',
      user,
      authorizable: Activity.getAuthorizable(),
    });
    const taskPerm = await this.authService.getPermissions({
      action: 'view',
      user,
      authorizable: Task.getAuthorizable(),
    });
    if (!activityPerm.allow && !taskPerm.allow) {
      throw new ForbiddenError();
    }

    const allowedBoardIds = await this.boardService.getAllowedTaskBoardIds({ accountId, userId: user.id });

    const allowedTypes = [];
    if (activityPerm.allow) {
      allowedTypes.push(TaskView.Activity);
    }
    if (taskPerm.allow) {
      allowedTypes.push(TaskView.Task);
    }

    const activityUsers = intersection(filter.ownerIds, activityPerm.userIds);
    const taskUsers = intersection(filter.ownerIds, taskPerm.userIds);

    const now = DateUtil.now();
    const meta = new TimeBoardMeta();
    const qb = this.createQueryBuilder(
      accountId,
      user.id,
      allowedBoardIds,
      allowedTypes,
      activityUsers,
      taskUsers,
      filter,
    );
    if (!filter.groups || filter.groups.includes(TaskGroupByTime.Unallocated)) {
      const unallocatedQb = qb
        .clone()
        .andWhere('at.is_resolved = false')
        .andWhere('at.start_date is null')
        .andWhere('at.end_date is null');

      meta.unallocated = await this.getStageMeta(unallocatedQb);
    }
    if (!filter.groups || filter.groups.includes(TaskGroupByTime.Overdue)) {
      const overdueQb = qb
        .clone()
        .andWhere('at.is_resolved = false')
        .andWhere(
          new Brackets((qbE) => {
            qbE.where('at.end_date < :now', { now }).orWhere('at.end_date is null AND at.start_date < :now', { now });
          }),
        );

      meta.overdue = await this.getStageMeta(overdueQb);
    }
    if (!filter.groups || filter.groups.includes(TaskGroupByTime.Today)) {
      const endOfTheDay = DateUtil.endOf(now, 'day');
      const todayQb = qb
        .clone()
        .andWhere('at.is_resolved = false')
        .andWhere(
          new Brackets((qbT) => {
            qbT
              .where('at.start_date <= :endOfTheDay AND at.end_date > :now', { endOfTheDay, now })
              .orWhere('at.end_date is null AND at.start_date >= :now AND at.start_date <= :endOfTheDay', {
                endOfTheDay,
                now,
              })
              .orWhere('at.start_date is null AND at.end_date >= :now AND at.end_date <= :endOfTheDay', {
                endOfTheDay,
                now,
              });
          }),
        );

      meta.today = await this.getStageMeta(todayQb);
    }
    if (!filter.groups || filter.groups.includes(TaskGroupByTime.Tomorrow)) {
      const tomorrowStart = DateUtil.add(DateUtil.startOf(now, 'day'), { days: 1 });
      const tomorrowEnd = DateUtil.add(DateUtil.endOf(now, 'day'), { days: 1 });
      const tomorrowQb = qb
        .clone()
        .andWhere('at.is_resolved = false')
        .andWhere(
          new Brackets((qbTm) => {
            qbTm
              .where('at.start_date >= :tomorrowStart AND at.start_date <= :tomorrowEnd', {
                tomorrowStart,
                tomorrowEnd,
              })
              .orWhere('at.start_date is null AND at.end_date >= :tomorrowStart AND at.end_date <= :tomorrowEnd', {
                tomorrowStart,
                tomorrowEnd,
              });
          }),
        );

      meta.tomorrow = await this.getStageMeta(tomorrowQb);
    }
    if (!filter.groups || filter.groups.includes(TaskGroupByTime.Upcoming)) {
      const tomorrowEnd = DateUtil.add(DateUtil.startOf(now, 'day'), { days: 2 });
      const upcomingQb = qb
        .clone()
        .andWhere('at.is_resolved = false')
        .andWhere(
          new Brackets((qbU) => {
            qbU
              .where('at.start_date > :tomorrowEnd', { tomorrowEnd })
              .orWhere('at.start_date is null AND at.end_date > :tomorrowEnd', { tomorrowEnd });
          }),
        );

      meta.upcoming = await this.getStageMeta(upcomingQb);
    }
    if ((!filter.groups && filter.showResolved !== false) || filter.groups?.includes(TaskGroupByTime.Resolved)) {
      const resolvedQb = qb.clone().andWhere('at.is_resolved = true');

      meta.resolved = await this.getStageMeta(resolvedQb);
    }

    const boardQb = qb.clone();
    if (filter.showResolved === false) {
      boardQb.andWhere(`at.is_resolved = false`);
    }
    meta.total = await this.getCount(boardQb.clone());
    meta.timeAllocation = await this.getUserTimeAllocation(boardQb.clone());

    return meta;
  }

  public async getTimeBoardItem(
    account: Account,
    user: User,
    type: TaskView,
    id: number,
    filter: TimeBoardFilter,
  ): Promise<TaskOrActivityCard | null> {
    switch (type) {
      case TaskView.Activity:
        return await this.activityCardService.getActivityCard(account.id, user, id, filter);
      case TaskView.Task:
        return await this.taskBoardService.getTaskBoardCard(account, user, id, filter);
    }
  }

  public async getCalendar(
    account: Account,
    user: User,
    periodDto: DatePeriodDto,
    filter: TimeBoardFilter,
  ): Promise<TaskOrActivityCard[]> {
    const activityPerm = await this.authService.getPermissions({
      action: 'view',
      user,
      authorizable: Activity.getAuthorizable(),
    });
    const taskPerm = await this.authService.getPermissions({
      action: 'view',
      user,
      authorizable: Task.getAuthorizable(),
    });
    if (!activityPerm.allow && !taskPerm.allow) {
      throw new ForbiddenError();
    }

    const allowedBoardIds = await this.boardService.getAllowedTaskBoardIds({ accountId: account.id, userId: user.id });

    const allowedTypes = [];
    if (activityPerm.allow) {
      allowedTypes.push(TaskView.Activity);
    }
    if (taskPerm.allow) {
      allowedTypes.push(TaskView.Task);
    }

    const activityUsers = intersection(filter.ownerIds, activityPerm.userIds);
    const taskUsers = intersection(filter.ownerIds, taskPerm.userIds);

    const qb = this.createQueryBuilder(
      account.id,
      user.id,
      allowedBoardIds,
      allowedTypes,
      activityUsers,
      taskUsers,
      filter,
    );
    if (filter.showResolved === false) {
      qb.andWhere('at.is_resolved = :isResolved', { isResolved: false });
    }

    const period = DatePeriod.fromDto(periodDto);
    if (period.from && period.to) {
      qb.andWhere('start_date < :to', { to: period.to }).andWhere('end_date > :from', { from: period.from });
    }

    const tasks = await qb.getRawMany();

    return this.createItemsFromRaw(account, user, tasks);
  }

  public async getCalendarMeta(
    account: Account,
    user: User,
    periodDto: DatePeriodDto,
    filter: TimeBoardFilter,
  ): Promise<TimeBoardCalendarMeta> {
    const activityPerm = await this.authService.getPermissions({
      action: 'view',
      user,
      authorizable: Activity.getAuthorizable(),
    });
    const taskPerm = await this.authService.getPermissions({
      action: 'view',
      user,
      authorizable: Task.getAuthorizable(),
    });
    if (!activityPerm.allow && !taskPerm.allow) {
      throw new ForbiddenError();
    }

    const allowedBoardIds = await this.boardService.getAllowedTaskBoardIds({ accountId: account.id, userId: user.id });

    const allowedTypes = [];
    if (activityPerm.allow) {
      allowedTypes.push(TaskView.Activity);
    }
    if (taskPerm.allow) {
      allowedTypes.push(TaskView.Task);
    }

    const activityUsers = intersection(filter.ownerIds, activityPerm.userIds);
    const taskUsers = intersection(filter.ownerIds, taskPerm.userIds);

    const qb = this.createQueryBuilder(
      account.id,
      user.id,
      allowedBoardIds,
      allowedTypes,
      activityUsers,
      taskUsers,
      filter,
    );

    qb.select('count(*)', 'total');

    if (filter.showResolved === false) {
      qb.andWhere('at.is_resolved = :isResolved', { isResolved: false });
    }

    const period = DatePeriod.fromDto(periodDto);
    if (period.from && period.to) {
      qb.andWhere('start_date < :to', { to: period.to }).andWhere('end_date > :from', { from: period.from });
    }
    const { total } = await qb.getRawOne<{ total: number }>();

    return new TimeBoardCalendarMeta({ total });
  }

  private createQueryBuilder(
    accountId: number,
    userId: number,
    _allowedBoardIds: number[],
    allowedTypes: string[],
    activityUsers: number[] | null | undefined,
    taskUsers: number[] | null | undefined,
    filter: TimeBoardFilter,
  ) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('at.*')
      .from('all_tasks', 'at')
      .where('at.account_id = :accountId', { accountId })
      .andWhere('at.type IN (:...allowedTypes)', { allowedTypes });
    //HACK: skip board check
    //.andWhere('(at.board_id is null or at.board_id IN (:...allowedBoardIds))', { allowedBoardIds });

    if (activityUsers || taskUsers) {
      qb.andWhere(
        new Brackets((qbP) => {
          qbP
            .where(
              new Brackets((qbA) => {
                qbA.where(`at.type = 'activity'`);
                if (activityUsers && activityUsers.length > 0) {
                  qbA.andWhere(`at.responsible_user_id IN (:...activityUsers)`, { activityUsers });
                } else if (activityUsers) {
                  qbA.andWhere(`at.responsible_user_id IS NULL`);
                }
              }),
            )
            .orWhere(
              new Brackets((qbT) => {
                qbT.where(`at.type = 'task'`);
                if (taskUsers && taskUsers.length > 0) {
                  qbT.andWhere(`at.responsible_user_id IN (:...taskUsers)`, { taskUsers });
                } else if (taskUsers) {
                  qbT.andWhere(`at.responsible_user_id IS NULL`);
                }
              }),
            );
          if (!filter.ownerIds) {
            qbP.orWhere('at.created_by = :userId', { userId });
          }
        }),
      );
    }

    if (filter.entityIds) {
      qb.andWhere(`at.entity_id IN (:...entityIds)`, { entityIds: filter.entityIds });
    }

    if (filter.search) {
      qb.andWhere(
        new Brackets((qbS) => {
          qbS
            .where(`at.text ILIKE :searchText`, { searchText: `%${filter.search}%` })
            .orWhere(`at.title ILIKE :searchTitle`, { searchTitle: `%${filter.search}%` });
        }),
      );
    }

    return qb;
  }

  private async getTasks<T>(
    qb: SelectQueryBuilder<T>,
    sorting: TaskSorting | null | undefined,
    paging: PagingQuery,
  ): Promise<T[]> {
    try {
      return await TaskBoardQueryHelper.addBoardOrderBy(qb, sorting)
        .offset(paging.skip)
        .limit(paging.take)
        .getRawMany<T>();
    } catch (e) {
      this.logger.error(`getTasks query: ${qb.getQuery()}`);
      this.logger.error(`getTasks error`, (e as Error)?.stack);
      throw e;
    }
  }

  private async getStageMeta<T>(qb: SelectQueryBuilder<T>): Promise<TimeBoardStageMeta> {
    const unallocatedCount = await this.getCount(qb.clone());
    const allocations = await this.getUserTimeAllocation(qb.clone());

    return new TimeBoardStageMeta(unallocatedCount, allocations);
  }

  private async getCount<T>(qb: SelectQueryBuilder<T>): Promise<number> {
    const { count } = await qb.select('COUNT(at.id)', 'count').getRawOne();
    return Number(count);
  }

  private async getUserTimeAllocation<T>(qb: SelectQueryBuilder<T>): Promise<UserTimeAllocation[]> {
    const allocations = await qb
      .groupBy('at.responsible_user_id')
      .select('at.responsible_user_id, SUM(at.planned_time) AS planned_time')
      .getRawMany();

    return allocations.map(
      (a) => new UserTimeAllocation(a.responsible_user_id, a.planned_time ? Number(a.planned_time) : 0),
    );
  }

  private async createItemsFromRaw(account: Account, user: User, items: any[]): Promise<TaskOrActivityCard[]> {
    const entityIds = items
      .map((item) => item.entity_id)
      .filter((id) => !!id)
      .filter(isUnique);
    const entityInfoCache = entityIds.length
      ? await this.entityInfoService.findMany({ accountId: account.id, user, entityIds })
      : [];

    const cards: TaskOrActivityCard[] = [];
    for (const item of items) {
      const entityInfo = item.entity_id ? entityInfoCache.find((ei) => ei.id === item.entity_id) : null;
      cards.push(await this.createItemFromRaw(account, user, item, entityInfo));
    }
    return cards;
  }

  private async createItemFromRaw(
    account: Account,
    user: User,
    item: any,
    entityInfo: EntityInfoDto | null,
  ): Promise<TaskOrActivityCard> {
    if (item.type === TaskView.Activity) {
      return await this.createActivityCardItem(user, item, entityInfo);
    } else if (item.type === TaskView.Task) {
      return await this.createTaskCardItem(account, user, item, entityInfo);
    } else {
      return null;
    }
  }

  private async createActivityCardItem(
    user: User,
    item: any,
    entityInfo: EntityInfoDto | null,
  ): Promise<ActivityCardDto | null> {
    const activity = new Activity(
      item.account_id,
      item.entity_id,
      item.created_by,
      item.responsible_user_id,
      item.text,
      item.activity_type_id,
      item.is_resolved,
      item.start_date ? new Date(item.start_date) : null,
      item.end_date ? new Date(item.end_date) : null,
      item.resolved_date ? new Date(item.resolved_date) : null,
      item.weight,
      item.result,
      new Date(item.created_at),
    );
    activity.id = item.id;
    return await this.activityCardService.createActivityCard(user, activity, entityInfo);
  }

  private async createTaskCardItem(
    account: Account,
    user: User,
    item: any,
    entityInfo: EntityInfoDto | null,
  ): Promise<TaskBoardCardDto | null> {
    const task = new Task(
      item.account_id,
      item.entity_id,
      item.created_by,
      item.responsible_user_id,
      item.text,
      item.title,
      item.planned_time,
      item.is_resolved,
      item.start_date ? new Date(item.start_date) : null,
      item.end_date ? new Date(item.end_date) : null,
      item.resolved_date ? new Date(item.resolved_date) : null,
      item.weight,
      item.board_id,
      item.stage_id,
      item.settings_id,
      item.external_id,
      new Date(item.created_at),
    );
    task.id = item.id;
    return await this.taskBoardService.createTaskBoardCard({ account, user, task, entityInfo });
  }
}
