import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { convert } from 'html-to-text';

import { DateUtil, FileLinkSource, NotFoundError, ServiceEvent } from '@/common';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { UserService } from '@/modules/iam/user/user.service';
import { ActionHelper, ActionTaskCreateSettings } from '@/modules/automation';
import { EntityInfoService } from '@/modules/entity/entity-info';
import { NotificationType } from '@/modules/notification/notification/enums/notification-type.enum';
import { CreateNotificationDto } from '@/modules/notification/notification/dto/create-notification.dto';

import { CrmEventType, TaskCreatedEvent, TaskEvent, TaskExtUpsertEvent, TaskUpdatedEvent } from '../common';
import { BaseTaskService } from '../base-task';
import { BoardService } from '../board/board.service';
import { BoardType } from '../board/enums';
import { BoardStageCode, BoardStageService } from '../board-stage';
import { TaskSubtaskService } from '../task-subtask/task-subtask.service';

import { EntityService } from '../Service/Entity/EntityService';
import { FileLinkService } from '../Service/FileLink/FileLinkService';

import { CreateTaskDto, TaskDto, UpdateTaskDto } from './dto';
import { Task } from './entities';

const BatchProcessLimit = 100;

interface FindFilter {
  accountId: number;
  boardId?: number;
  taskId?: number | number[];
  entityId?: number;
  isResolved?: boolean;
  responsibles?: number | number[];
  externalId?: string;
}

@Injectable()
export class TaskService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Task)
    private readonly repository: Repository<Task>,
    private readonly authService: AuthorizationService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => EntityService))
    private readonly entityService: EntityService,
    private readonly fileLinkService: FileLinkService,
    private readonly subtaskService: TaskSubtaskService,
    private readonly baseTaskService: BaseTaskService,
    @Inject(forwardRef(() => BoardStageService))
    private readonly stageService: BoardStageService,
    @Inject(forwardRef(() => BoardService))
    private readonly boardService: BoardService,
    private readonly entityInfoService: EntityInfoService,
  ) {}

  public async create({
    accountId,
    user,
    dto,
    skipPermissionCheck,
    event,
  }: {
    accountId: number;
    user: User;
    dto: CreateTaskDto;
    skipPermissionCheck?: boolean;
    event?: ServiceEvent;
  }): Promise<Task> {
    if (!skipPermissionCheck) {
      await this.authService.check({
        action: 'create',
        user,
        authorizable: Task.getAuthorizable(),
        throwError: true,
      });
    }

    if (!dto.boardId) {
      dto.boardId = await this.boardService.findOneId({ accountId, isSystem: true, type: BoardType.Task });
    }

    if (dto.isResolved || !dto.stageId) {
      dto.stageId = await this.stageService.findOneId({
        accountId,
        boardId: dto.boardId,
        includeCodes: dto.isResolved ? [BoardStageCode.Done] : undefined,
      });
    }

    dto.weight = dto.weight ?? (await this.baseTaskService.calculateWeight(accountId, dto.afterId, dto.beforeId));
    const task = await this.repository.save(Task.create(accountId, user.id, dto));

    if (dto.fileIds) {
      await this.fileLinkService.processFiles(accountId, FileLinkSource.TASK, task.id, dto.fileIds);
    }

    if (dto.subtasks) {
      await this.subtaskService.createMany(accountId, task.id, dto.subtasks);
    }

    this.eventEmitter.emit(
      CrmEventType.TaskCreated,
      new TaskCreatedEvent({
        source: Task.name,
        accountId,
        taskId: task.id,
        boardId: task.boardId,
        externalId: task.externalId,
        ownerId: task.responsibleUserId,
        entityId: task.entityId ?? null,
        createdBy: task.createdBy,
        taskTitle: task.title,
        taskText: task.text,
        createdAt: task.createdAt,
        startDate: task.startDate,
        endDate: task.endDate,
        prevEvent: event,
      }),
    );

    return task;
  }

  public async createAndGetDto(account: Account, user: User, dto: CreateTaskDto): Promise<TaskDto> {
    const task = await this.create({ accountId: account.id, user, dto });

    return await this.createDtoForTask(account, user, task);
  }

  public async findOne(filter: FindFilter): Promise<Task | null> {
    return this.createFindQb(filter).getOne();
  }
  public async findMany(filter: FindFilter): Promise<Task[]> {
    return this.createFindQb(filter).orderBy('task.id', 'DESC').getMany();
  }

  public async findDtoById(account: Account, user: User, id: number): Promise<TaskDto | null> {
    const task = await this.findOne({ accountId: account.id, taskId: id });
    return task ? await this.createDtoForTask(account, user, task) : null;
  }

  public async update({
    accountId,
    user,
    taskId,
    dto,
    skipPermissionCheck,
    event,
  }: {
    accountId: number;
    user: User | null;
    taskId: number;
    dto: UpdateTaskDto;
    skipPermissionCheck?: boolean;
    event?: ServiceEvent;
  }): Promise<Task> {
    const task = await this.repository.findOneBy({ id: taskId });
    if (!task) {
      throw NotFoundError.withId(Task, taskId);
    }
    return this.updateTask({ accountId, user, task, dto, skipPermissionCheck, event });
  }

  private async updateTask({
    accountId,
    user,
    task,
    dto,
    skipPermissionCheck,
    event,
  }: {
    accountId: number;
    user: User | null;
    task: Task;
    dto: UpdateTaskDto;
    skipPermissionCheck?: boolean;
    event?: ServiceEvent;
  }): Promise<Task> {
    if (!skipPermissionCheck && user) {
      await this.authService.check({ action: 'edit', user, authorizable: task, throwError: true });
    }

    if (!task.hasChanges(dto) && !dto.sorting && !dto.fileIds && !dto.subtasks) {
      return task;
    }

    if (dto.fileIds !== undefined) {
      await this.fileLinkService.processFiles(accountId, FileLinkSource.TASK, task.id, dto.fileIds ?? []);
    }

    if (dto.subtasks !== undefined) {
      await this.subtaskService.processBatch(accountId, task.id, dto.subtasks);
    }

    const { entityId } = task;

    if (dto.sorting) {
      task.weight = await this.baseTaskService.calculateWeight(accountId, dto.sorting.afterId, dto.sorting.beforeId);
    }

    if (dto.entityId !== undefined && dto.entityId !== task.entityId) {
      const taskBoardId = dto.entityId ? await this.getProjectTaskBoardId(accountId, dto.entityId) : undefined;
      if (taskBoardId && taskBoardId !== task.boardId) {
        dto.boardId = taskBoardId;
        dto.stageId = await this.stageService.findOneId({
          accountId,
          boardId: dto.boardId ?? task.boardId,
          includeCodes: (dto.isResolved ?? task.isResolved) ? [BoardStageCode.Done] : undefined,
        });
      } else if (!taskBoardId && task.boardId) {
        dto.boardId = await this.boardService.findOneId({ accountId, isSystem: true, type: BoardType.Task });
        dto.stageId = await this.stageService.findOneId({
          accountId,
          boardId: dto.boardId ?? task.boardId,
          includeCodes: (dto.isResolved ?? task.isResolved) ? [BoardStageCode.Done] : undefined,
        });
      }
    } else if (dto.isResolved !== undefined && !dto.stageId && dto.isResolved !== task.isResolved) {
      dto.stageId = await this.stageService.findOneId({
        accountId,
        boardId: dto.boardId ?? task.boardId,
        includeCodes: dto.isResolved ? [BoardStageCode.Done] : undefined,
      });
    } else if (dto.isResolved === undefined) {
      const stageChanged = dto.stageId && dto.stageId !== task.stageId;
      const boardChanged = dto.boardId && dto.boardId !== task.boardId;
      if (stageChanged || boardChanged) {
        const stage = await this.stageService.findOne({
          accountId,
          stageId: stageChanged ? dto.stageId : undefined,
          boardId: boardChanged ? dto.boardId : undefined,
          includeCodes: !stageChanged && boardChanged && task.isResolved ? [BoardStageCode.Done] : undefined,
        });
        dto.isResolved = stage?.code === BoardStageCode.Done;
        dto.stageId = stage?.id;
        dto.boardId = stage?.boardId;
      }
    }

    await this.repository.save(task.update(dto));

    this.eventEmitter.emit(
      CrmEventType.TaskUpdated,
      new TaskUpdatedEvent({
        source: Task.name,
        accountId,
        taskId: task.id,
        boardId: task.boardId,
        externalId: task.externalId,
        ownerId: task.responsibleUserId,
        entityId: task.entityId ?? null,
        createdBy: task.createdBy,
        taskTitle: task.title,
        taskText: task.text,
        createdAt: task.createdAt,
        startDate: task.startDate,
        endDate: task.endDate,
        prevEntityId: entityId,
        prevEvent: event,
      }),
    );

    return task;
  }

  public async updateAndGetDto(account: Account, user: User, taskId: number, dto: UpdateTaskDto): Promise<TaskDto> {
    const task = await this.update({ accountId: account.id, user, taskId, dto });

    return await this.createDtoForTask(account, user, task);
  }

  private async getProjectTaskBoardId(accountId: number, entityId: number): Promise<number | undefined> {
    const entity = await this.entityService.findOne(accountId, { entityId });
    if (entity?.boardId) {
      const board = await this.boardService.findOne({ filter: { accountId, boardId: entity.boardId } });

      return board?.taskBoardId;
    }

    return undefined;
  }

  public async delete({ user, filter, event }: { user: User | null; filter: FindFilter; event?: ServiceEvent | null }) {
    const tasks = await this.findMany(filter);
    await Promise.all(
      tasks.map(async (task) => {
        if (user) {
          await this.authService.check({ action: 'delete', user, authorizable: task, throwError: true });
        }

        await this.fileLinkService.processFiles(task.accountId, FileLinkSource.TASK, task.id, []);
        await this.repository.delete({ id: task.id });
        this.eventEmitter.emit(
          CrmEventType.TaskDeleted,
          new TaskEvent({
            source: Task.name,
            accountId: task.accountId,
            taskId: task.id,
            boardId: task.boardId,
            externalId: task.externalId,
            entityId: task.entityId,
            prevEvent: event,
          }),
        );
      }),
    );
  }

  public async changeResponsible({
    accountId,
    currentUserId,
    newUserId,
  }: {
    accountId: number;
    currentUserId: number;
    newUserId: number;
  }) {
    await this.repository.update({ accountId, responsibleUserId: currentUserId }, { responsibleUserId: newUserId });
  }

  public async changeStageForAll({
    accountId,
    boardId,
    stageId,
    newStageId,
  }: {
    accountId: number;
    boardId: number;
    stageId: number;
    newStageId: number;
  }) {
    const qb = this.repository
      .createQueryBuilder('task')
      .select('task.id', 'id')
      .where('task.account_id = :accountId', { accountId })
      .andWhere('task.board_id = :boardId', { boardId })
      .andWhere('task.stage_id = :stageId', { stageId })
      .limit(BatchProcessLimit);
    let tasks: { id: number }[] = [];
    do {
      tasks = await qb.getRawMany<{ id: number }>();
      for (const task of tasks) {
        await this.update({
          accountId,
          user: null,
          taskId: task.id,
          dto: { boardId: boardId, stageId: newStageId },
          skipPermissionCheck: true,
        });
      }
    } while (tasks.length);
  }

  public async handleUpsertExt(event: TaskExtUpsertEvent): Promise<Task | null> {
    const user = await this.userService.findOne({ accountId: event.accountId, id: event.ownerId });
    if (user) {
      const { accountId, boardId, taskId, externalId } = event;
      let task = event.externalId ? await this.findOne({ accountId, boardId, externalId }) : undefined;
      if (!task && event.taskId) {
        task = await this.findOne({ accountId, boardId, taskId });
      }

      if (task) {
        return this.updateTask({
          accountId,
          user,
          task,
          dto: {
            title: event.title,
            text: event.text,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
            externalId,
          },
          skipPermissionCheck: true,
          event,
        });
      } else {
        return this.create({
          accountId,
          user,
          dto: {
            boardId,
            responsibleUserId: event.ownerId,
            title: event.title,
            text: event.text,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
            externalId,
          },
          skipPermissionCheck: true,
          event,
        });
      }
    }
    return null;
  }

  public async processAutomation({
    accountId,
    entityId,
    entityOwnerId,
    entityStageId,
    settings,
  }: {
    accountId: number;
    entityId: number;
    entityOwnerId: number;
    entityStageId: number | null | undefined;
    settings: ActionTaskCreateSettings;
  }): Promise<Task | null> {
    const entity = await this.entityInfoService.findOne({ accountId, entityId });
    if (entity && (!entity.stageId || settings.allowAnyStage || entity.stageId === entityStageId)) {
      const user = await this.userService.findOne({ accountId, id: entityOwnerId });
      const ownerId = settings.responsibleUserId ?? entityOwnerId;
      const startDate = DateUtil.add(DateUtil.now(), { seconds: settings.deferStart ?? 0 });
      const endDate = ActionHelper.getEndDate({
        startDate,
        deadlineType: settings.deadlineType,
        deadlineTime: settings.deadlineTime,
      });
      return this.create({
        accountId,
        user,
        dto: {
          responsibleUserId: ownerId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          title: settings.title,
          text: settings.text,
          entityId: entityId,
          boardId: null,
          stageId: null,
          settingsId: null,
          plannedTime: null,
        },
        skipPermissionCheck: true,
      });
    }
    return null;
  }

  public async getOverdueNotifications(from: Date, to: Date): Promise<CreateNotificationDto[]> {
    const tasks = await this.repository
      .createQueryBuilder('task')
      .where('task.is_resolved = false')
      .andWhere('task.end_date > :from', { from })
      .andWhere('task.end_date <= :to', { to })
      .getMany();
    return tasks.map(
      (task) =>
        new CreateNotificationDto(
          task.accountId,
          task.responsibleUserId,
          NotificationType.TASK_OVERDUE,
          task.id,
          task.entityId,
          task.createdBy,
          task.title,
          convert(task.text),
        ),
    );
  }

  public async getOverdueForFollowNotifications(
    notifyUserId: number,
    from: Date,
    to: Date,
    followUserIds: number[],
  ): Promise<CreateNotificationDto[]> {
    const tasks = await this.repository
      .createQueryBuilder('task')
      .where('task.is_resolved = false')
      .andWhere('task.end_date > :from', { from })
      .andWhere('task.end_date <= :to', { to })
      .andWhere('task.responsible_user_id in (:...userIds)', { userIds: followUserIds })
      .getMany();
    return tasks.map(
      (task) =>
        new CreateNotificationDto(
          task.accountId,
          notifyUserId,
          NotificationType.TASK_OVERDUE_EMPLOYEE,
          task.id,
          task.entityId,
          task.responsibleUserId,
          task.title,
          convert(task.text),
        ),
    );
  }

  public async getBeforeStartNotifications(userId: number, from: Date, to: Date) {
    const tasks = await this.repository
      .createQueryBuilder('task')
      .where('task.is_resolved = false')
      .andWhere('task.responsible_user_id = :userId', { userId })
      .andWhere('task.start_date > :from', { from })
      .andWhere('task.start_date <= :to', { to })
      .getMany();
    return tasks.map(
      (task) =>
        new CreateNotificationDto(
          task.accountId,
          task.responsibleUserId,
          NotificationType.TASK_BEFORE_START,
          task.id,
          task.entityId,
          task.createdBy,
          task.title,
          convert(task.text),
        ),
    );
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('task')
      .where('task.accountId = :accountId', { accountId: filter.accountId });
    if (filter.boardId) {
      qb.andWhere('task.board_id = :boardId', { boardId: filter.boardId });
    }
    if (filter.taskId) {
      if (Array.isArray(filter.taskId)) {
        qb.andWhere('task.id IN (:...taskIds)', { taskIds: filter.taskId });
      } else {
        qb.andWhere('task.id = :taskId', { taskId: filter.taskId });
      }
    }
    if (filter.entityId) {
      qb.andWhere('task.entity_id = :entityId', { entityId: filter.entityId });
    }
    if (filter.isResolved !== undefined) {
      qb.andWhere('task.is_resolved = :isResolved', { isResolved: filter.isResolved });
    }
    if (filter.responsibles) {
      if (Array.isArray(filter.responsibles)) {
        if (filter.responsibles.length === 0) {
          return qb.where('1 = 0');
        }
        qb.andWhere('task.responsible_user_id IN (:...responsibles)', { responsibles: filter.responsibles });
      } else {
        qb.andWhere('task.responsible_user_id = :responsible', { responsible: filter.responsibles });
      }
    }
    if (filter.externalId) {
      qb.andWhere('task.external_id = :externalId', { externalId: filter.externalId });
    }

    return qb;
  }

  private async createDtoForTask(account: Account, user: User, task: Task): Promise<TaskDto | null> {
    if (!(await this.authService.check({ action: 'view', user, authorizable: task }))) {
      return null;
    }

    const fileLinks = await this.fileLinkService.getFileLinkDtos(account, FileLinkSource.TASK, task.id);
    const subtasks = await this.subtaskService.findMany(task.accountId, { taskId: task.id });
    const entityInfo = task.entityId
      ? await this.entityInfoService.findOne({
          accountId: account.id,
          user,
          entityId: task.entityId,
        })
      : null;
    const userRights = await this.authService.getUserRights({ user, authorizable: task });

    return new TaskDto(
      task,
      entityInfo,
      fileLinks,
      subtasks.map((s) => s.toDto()),
      userRights,
    );
  }
}
