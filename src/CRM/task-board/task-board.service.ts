import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DatePeriod, DatePeriodDto, FileLinkSource, isUnique, NumberUtil, PagingQuery } from '@/common';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { EntityInfoDto, EntityInfoService } from '@/modules/entity/entity-info';

import { BoardStageService } from '../board-stage';
import { Task } from '../task';
import { TaskSubtaskService } from '../task-subtask/task-subtask.service';

import { FileLinkService } from '../Service/FileLink/FileLinkService';

import { TaskBoardQueryHelper } from '../Service/BaseTaskBoard/TaskBoardQueryHelper';
import { UserTimeAllocation } from '../Service/BaseTaskBoard/UserTimeAllocation';
import {
  TaskBoardCardDto,
  TaskBoardFilterDto,
  TaskBoardMeta,
  TaskBoardStageMeta,
  TaskCalendarMeta,
  TaskListMeta,
} from './dto';

@Injectable()
export class TaskBoardService {
  constructor(
    @InjectRepository(Task)
    private readonly repository: Repository<Task>,
    private readonly authService: AuthorizationService,
    @Inject(forwardRef(() => BoardStageService))
    private readonly stageService: BoardStageService,
    private readonly fileLinkService: FileLinkService,
    private readonly subtaskService: TaskSubtaskService,
    private readonly entityInfoService: EntityInfoService,
  ) {}

  public async getTaskList(
    account: Account,
    user: User,
    boardId: number,
    filter: TaskBoardFilterDto,
    paging: PagingQuery,
  ): Promise<TaskBoardCardDto[]> {
    const responsibles = await this.getResponsibles({ accountId: account.id, user, entityIds: filter?.entityIds });

    const qb = TaskBoardQueryHelper.createBoardQueryBuilder(
      account.id,
      user.id,
      this.repository,
      filter,
      responsibles,
      true,
      'title',
    );

    const stageIds = filter.stageIds ?? (await this.stageService.findManyIds({ accountId: account.id, boardId }));
    if (stageIds) {
      qb.andWhere('stage_id IN (:...stageIds)', { stageIds });
    }

    if (filter.showResolved === false) {
      qb.andWhere('is_resolved = :isResolved', { isResolved: false });
    }

    const tasks = await qb.offset(paging.skip).limit(paging.take).getMany();

    return this.createTaskBoardCards({ account, user, tasks });
  }

  public async getTaskListMeta(
    accountId: number,
    user: User,
    boardId: number,
    filter: TaskBoardFilterDto,
  ): Promise<TaskListMeta> {
    const responsibles = await this.getResponsibles({ accountId, user, entityIds: filter?.entityIds });

    const qb = TaskBoardQueryHelper.createBoardQueryBuilder(
      accountId,
      user.id,
      this.repository,
      filter,
      responsibles,
      false,
      'title',
    );

    const stageIds = filter.stageIds ?? (await this.stageService.findManyIds({ accountId, boardId }));
    if (stageIds) {
      qb.andWhere('stage_id IN (:...stageIds)', { stageIds });
    }

    if (filter.showResolved === false) {
      qb.andWhere('is_resolved = :isResolved', { isResolved: false });
    }

    const total = await qb.getCount();

    const boardAllocations = await qb
      .groupBy('responsible_user_id')
      .select('responsible_user_id, SUM(planned_time) AS planned_time')
      .getRawMany();
    const timeAllocation = boardAllocations.map(
      (a) => new UserTimeAllocation(a.responsible_user_id, NumberUtil.toNumber(a.planned_time)),
    );

    return { total, timeAllocation };
  }

  public async getTaskBoardCards(
    account: Account,
    user: User,
    boardId: number,
    filter: TaskBoardFilterDto,
    paging: PagingQuery,
  ): Promise<TaskBoardCardDto[]> {
    const responsibles = await this.getResponsibles({ accountId: account.id, user, entityIds: filter?.entityIds });

    const stageIds = filter.stageIds ?? (await this.stageService.findManyIds({ accountId: account.id, boardId }));

    const qb = TaskBoardQueryHelper.createBoardQueryBuilder(
      account.id,
      user.id,
      this.repository,
      filter,
      responsibles,
      true,
      'title',
    );
    if (filter.showResolved === false) {
      qb.andWhere('is_resolved = :isResolved', { isResolved: false });
    }

    const tasks = (
      await Promise.all(
        stageIds.map(async (stageId) =>
          qb.clone().andWhere('stage_id = :stageId', { stageId }).offset(paging.skip).limit(paging.take).getMany(),
        ),
      )
    ).flat();

    return this.createTaskBoardCards({ account, user, tasks });
  }

  public async getTaskBoardCard(
    account: Account,
    user: User,
    taskId: number,
    filter: TaskBoardFilterDto,
    boardId?: number,
  ): Promise<TaskBoardCardDto | null> {
    const responsibles = await this.getResponsibles({ accountId: account.id, user, entityIds: filter?.entityIds });

    const stageIds =
      filter.stageIds ?? (boardId ? await this.stageService.findManyIds({ accountId: account.id, boardId }) : null);

    const qb = TaskBoardQueryHelper.createBoardQueryBuilder(
      account.id,
      user.id,
      this.repository,
      filter,
      responsibles,
      false,
      'title',
    );

    if (stageIds) {
      qb.andWhere('stage_id IN (:...stageIds)', { stageIds });
    }

    if (filter.showResolved === false) {
      qb.andWhere('is_resolved = :isResolved', { isResolved: false });
    }

    const task = await qb.andWhere('id = :id', { id: taskId }).getOne();

    return task ? this.createTaskBoardCard({ account, user, task }) : null;
  }

  public async getTaskBoardMeta(
    accountId: number,
    user: User,
    boardId: number,
    filter: TaskBoardFilterDto,
  ): Promise<TaskBoardMeta> {
    const responsibles = await this.getResponsibles({ accountId, user, entityIds: filter?.entityIds });

    const stageIds = filter.stageIds ?? (await this.stageService.findManyIds({ accountId, boardId }));

    const qb = TaskBoardQueryHelper.createBoardQueryBuilder(
      accountId,
      user.id,
      this.repository,
      filter,
      responsibles,
      false,
      'title',
    );
    if (filter.showResolved === false) {
      qb.andWhere('is_resolved = :isResolved', { isResolved: false });
    }

    const stages: TaskBoardStageMeta[] = (
      await Promise.all(
        stageIds.map(async (stageId) => {
          const stagedQb = qb.clone().andWhere('stage_id = :stageId', { stageId });
          const total = await stagedQb.getCount();
          const allocations = await stagedQb
            .groupBy('responsible_user_id')
            .select('responsible_user_id', 'user_id')
            .addSelect('COALESCE(SUM(planned_time), 0)::int', 'planned_time')
            .getRawMany<{ user_id: number; planned_time: number }>();

          return {
            id: stageId,
            total,
            timeAllocation: allocations.map((a) => new UserTimeAllocation(a.user_id, a.planned_time)),
          };
        }),
      )
    ).flat();

    const boardQb = qb.clone().andWhere('stage_id IN (:...stageIds)', { stageIds });
    if (filter.showResolved === false) {
      boardQb.andWhere('is_resolved = :isResolved', { isResolved: false });
    }
    const total = await boardQb.getCount();
    const boardAllocations = await boardQb
      .groupBy('responsible_user_id')
      .select('responsible_user_id', 'user_id')
      .addSelect('COALESCE(SUM(planned_time), 0)::int', 'planned_time')
      .getRawMany<{ user_id: number; planned_time: number }>();
    const timeAllocation = boardAllocations.map(
      (a) => new UserTimeAllocation(a.user_id, NumberUtil.toNumber(a.planned_time)),
    );

    return { total, stages, timeAllocation };
  }

  public async getTaskCalendar(
    account: Account,
    user: User,
    boardId: number,
    periodDto: DatePeriodDto,
    filter: TaskBoardFilterDto,
  ): Promise<TaskBoardCardDto[]> {
    const responsibles = await this.getResponsibles({ accountId: account.id, user, entityIds: filter?.entityIds });

    const qb = TaskBoardQueryHelper.createBoardQueryBuilder(
      account.id,
      user.id,
      this.repository,
      filter,
      responsibles,
      true,
      'title',
    );

    const stageIds = filter.stageIds ?? (await this.stageService.findManyIds({ accountId: account.id, boardId }));
    if (stageIds) {
      qb.andWhere('stage_id IN (:...stageIds)', { stageIds });
    }
    if (filter.showResolved === false) {
      qb.andWhere('is_resolved = :isResolved', { isResolved: false });
    }

    const period = DatePeriod.fromDto(periodDto);
    if (period.from && period.to) {
      qb.andWhere('start_date < :to', { to: period.to }).andWhere('end_date > :from', { from: period.from });
    }

    const tasks = await qb.getMany();

    return this.createTaskBoardCards({ account, user, tasks });
  }

  public async getTaskCalendarMeta(
    account: Account,
    user: User,
    boardId: number,
    periodDto: DatePeriodDto,
    filter: TaskBoardFilterDto,
  ): Promise<TaskCalendarMeta> {
    const responsibles = await this.getResponsibles({ accountId: account.id, user, entityIds: filter?.entityIds });

    const qb = TaskBoardQueryHelper.createBoardQueryBuilder(
      account.id,
      user.id,
      this.repository,
      filter,
      responsibles,
      true,
      'title',
    );

    const stageIds = filter.stageIds ?? (await this.stageService.findManyIds({ accountId: account.id, boardId }));
    if (stageIds) {
      qb.andWhere('stage_id IN (:...stageIds)', { stageIds });
    }
    if (filter.showResolved === false) {
      qb.andWhere('is_resolved = :isResolved', { isResolved: false });
    }

    const period = DatePeriod.fromDto(periodDto);
    if (period.from && period.to) {
      qb.andWhere('start_date < :to', { to: period.to }).andWhere('end_date > :from', { from: period.from });
    }
    const total = await qb.getCount();

    return { total };
  }

  public async createTaskBoardCards({
    account,
    user,
    tasks,
  }: {
    account: Account;
    user: User;
    tasks: Task[];
  }): Promise<TaskBoardCardDto[]> {
    const entityIds = tasks
      .map((task) => task.entityId)
      .filter((id) => !!id)
      .filter(isUnique);
    const entityInfoCache = entityIds.length
      ? await this.entityInfoService.findMany({ accountId: account.id, user, entityIds })
      : [];

    const cards = await Promise.all(
      tasks.map(async (task, idx) => {
        const entityInfo = task.entityId ? entityInfoCache.find((ei) => ei.id === task.entityId) : null;
        const card = await this.createTaskBoardCard({ account, user, task, entityInfo });
        return { idx, card };
      }),
    );
    return cards.sort((a, b) => a.idx - b.idx).map((c) => c.card);
  }

  public async createTaskBoardCard({
    account,
    user,
    task,
    entityInfo = null,
  }: {
    account: Account;
    user: User;
    task: Task;
    entityInfo?: EntityInfoDto | null;
  }): Promise<TaskBoardCardDto> {
    const entityInfoCurrent =
      !entityInfo && task.entityId
        ? await this.entityInfoService.findOne({ accountId: account.id, user, entityId: task.entityId })
        : entityInfo;
    const userRights = await this.authService.getUserRights({ user, authorizable: task });
    const fileLinks = await this.fileLinkService.getFileLinkDtos(account, FileLinkSource.TASK, task.id);
    const subtaskCount = await this.subtaskService.getCount(account.id, { taskId: task.id });

    return new TaskBoardCardDto(task, entityInfoCurrent, fileLinks, userRights, subtaskCount);
  }

  private async getResponsibles({
    accountId,
    user,
    entityIds,
  }: {
    accountId: number;
    user: User;
    entityIds?: number[] | null;
  }): Promise<number[] | null> {
    if (entityIds?.length === 1) {
      const entityInfo = await this.entityInfoService.findOne({ accountId, entityId: entityIds[0] });
      if (entityInfo.participantIds?.length > 0) {
        return entityInfo.participantIds.includes(user.id) ? null : [user.id];
      }
    }
    return await this.authService.whoCanView({ user, authorizable: Task.getAuthorizable() });
  }
}
