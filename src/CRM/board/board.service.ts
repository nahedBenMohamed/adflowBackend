import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { BadRequestError, isUnique, NotFoundError } from '@/common';

import { UserRights } from '@/modules/iam/common';
import { User } from '@/modules/iam/user/entities/user.entity';

import { BoardEvent, CrmEventType, EntityCategory } from '../common';
import { BoardStageCode, BoardStageService } from '../board-stage';
import { EntityTypeService } from '../entity-type/entity-type.service';

import { CreateBoardDto, UpdateBoardDto } from './dto';
import { Board } from './entities';
import { BoardType } from './enums';

interface FindFilter {
  accountId: number;
  boardId?: number;
  isSystem?: boolean;
  type?: BoardType;
  recordId?: number;
}

@Injectable()
export class BoardService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Board)
    private readonly repository: Repository<Board>,
    @Inject(forwardRef(() => EntityTypeService))
    private readonly entityTypeService: EntityTypeService,
    @Inject(forwardRef(() => BoardStageService))
    private readonly stageService: BoardStageService,
  ) {}

  //TODO: split user and owner!!!
  public async create({
    accountId,
    user,
    dto,
    options: { ownerId = null, isSystem = false, taskBoardId = null, createDefaultStages = true } = {},
  }: {
    accountId: number;
    user: User | null;
    dto: CreateBoardDto;
    options?: {
      ownerId?: number | null;
      isSystem?: boolean;
      taskBoardId?: number | null;
      createDefaultStages?: boolean;
    };
  }): Promise<Board> {
    let ownerIdCurrent = ownerId;
    if (!ownerIdCurrent) {
      ownerIdCurrent = isSystem || dto.type === BoardType.EntityType ? null : user?.id;
    }
    let taskBoardIdCurrent = taskBoardId;
    if (!taskBoardIdCurrent && dto.type === BoardType.EntityType && dto.recordId) {
      const taskBoard = await this.createLinkedTaskBoard({
        accountId,
        user,
        name: dto.name,
        entityTypeId: dto.recordId,
      });
      taskBoardIdCurrent = taskBoard?.id;
    }
    if (dto.sortOrder === undefined) {
      const maxSortOrder = await this.createFindQb({ accountId, type: dto.type, recordId: dto.recordId })
        .select('MAX(board.sort_order)', 'max')
        .orderBy()
        .getRawOne<{ max: number }>();

      dto.sortOrder = (maxSortOrder?.max ?? 0) + 1;
    }
    const board = await this.repository.save(
      Board.fromDto({ accountId, dto, isSystem, ownerId: ownerIdCurrent, taskBoardId: taskBoardIdCurrent }),
    );
    if (createDefaultStages) {
      await this.createDefaultStages({ accountId, board });
    }

    if (user) {
      board.userRights = this.getUserRights({ user, board });
    }

    this.eventEmitter.emit(
      CrmEventType.BoardCreated,
      new BoardEvent({ accountId, userId: ownerIdCurrent, boardId: board.id }),
    );
    return board;
  }

  public async findOne({ user = null, filter }: { user?: User | null; filter: FindFilter }): Promise<Board> {
    const board = await this.createFindQb(filter).getOne();

    if (board && user) {
      board.userRights = this.getUserRights({ user, board });
    }

    return board;
  }
  public async findMany({ user = null, filter }: { user?: User | null; filter: FindFilter }): Promise<Board[]> {
    const boards = await this.createFindQb(filter).getMany();

    if (user) {
      for (const board of boards) {
        board.userRights = this.getUserRights({ user, board });
      }

      return boards.filter((board) => board.userRights.canView);
    }

    return boards;
  }

  public async findOneId(filter: FindFilter): Promise<number | null> {
    const result = await this.createFindQb(filter).select('board.id', 'id').getRawOne();

    return result?.id ?? null;
  }
  public async findManyIds(filter: FindFilter): Promise<number[]> {
    const result = await this.createFindQb(filter).select('board.id', 'id').getRawMany();

    return result.map((r) => r.id);
  }

  public async count(filter: FindFilter): Promise<number> {
    return await this.createFindQb(filter).getCount();
  }

  public async getAllowedTaskBoardIds({ accountId, userId }: { accountId: number; userId: number }): Promise<number[]> {
    const ids = await this.repository
      .createQueryBuilder('b')
      .select('b.id', 'id')
      .where('b.account_id = :accountId', { accountId })
      .andWhere('b.type = :boardType', { boardType: BoardType.Task })
      .andWhere(
        new Brackets((qb) =>
          qb
            .where('b.owner_id = :ownerId', { ownerId: userId })
            .orWhere(`b.participant_ids @> '[${userId}]'`)
            .orWhere('b.is_system = true'),
        ),
      )
      .getRawMany();
    return ids.map((i) => i.id);
  }

  public async update({
    accountId,
    user,
    boardId,
    dto,
  }: {
    accountId: number;
    user: User;
    boardId: number;
    dto: UpdateBoardDto;
  }): Promise<Board> {
    const board = await this.findOne({ user, filter: { accountId, boardId } });
    if (!board) {
      throw NotFoundError.withId(Board, boardId);
    }

    await this.repository.save(board.update(dto));

    if (dto.name && board.type === BoardType.EntityType && board.taskBoardId !== null) {
      this.update({ accountId, user, boardId: board.taskBoardId, dto: { name: dto.name } });
    }

    board.userRights = this.getUserRights({ user, board });

    this.eventEmitter.emit(
      CrmEventType.BoardUpdated,
      new BoardEvent({ accountId, userId: user.id, boardId: board.id }),
    );

    return board;
  }

  public async changeUser({
    accountId,
    userId,
    newUserId,
  }: {
    accountId: number;
    userId: number;
    newUserId?: number | null;
  }) {
    if (newUserId) {
      await this.repository.update({ accountId, ownerId: userId }, { ownerId: newUserId });
    } else {
      await this.repository.delete({ accountId, ownerId: userId });
    }

    const boards = await this.repository
      .createQueryBuilder('board')
      .where(`board.account_id = :accountId`, { accountId })
      .andWhere(`board.participant_ids @> :userId`, { userId })
      .getMany();
    for (const board of boards) {
      board.participantIds = newUserId
        ? board.participantIds.map((id) => (id === userId ? newUserId : id)).filter(isUnique)
        : board.participantIds.filter((id) => id !== userId);
      await this.repository.save(board);
    }
  }

  public async delete({
    accountId,
    userId,
    boardId,
    preserveLast,
  }: {
    accountId: number;
    userId: number;
    boardId: number;
    preserveLast?: boolean;
  }) {
    const board = await this.findOne({ filter: { accountId, boardId } });
    if (board) {
      if (board.isSystem) {
        throw new BadRequestError('Cannot delete system board');
      }
      if (board.type === BoardType.EntityType) {
        if (preserveLast && board.recordId) {
          const count = await this.count({ accountId, type: BoardType.EntityType, recordId: board.recordId });
          if (count <= 1) {
            throw new BadRequestError('Cannot delete last entity board');
          }
        }
        if (board.taskBoardId) {
          await this.delete({ accountId, userId, boardId: board.taskBoardId });
        }
      }
      await this.stageService.deleteMany({ accountId: accountId, boardId: board.id });
      await this.repository.delete({ id: board.id });
      this.eventEmitter.emit(
        CrmEventType.BoardDeleted,
        new BoardEvent({ accountId: accountId, userId, boardId: board.id }),
      );
    }
  }

  public async deleteMany({ userId, filter }: { userId: number; filter: FindFilter }) {
    const boardIds = await this.findManyIds(filter);
    await Promise.all(boardIds.map((boardId) => this.delete({ accountId: filter.accountId, userId, boardId })));
  }

  private getUserRights({ user, board }: { user: User | null; board: Board }): UserRights {
    if (user === null) {
      return UserRights.none();
    } else if (board.type === BoardType.EntityType) {
      return UserRights.full();
    } else if (board.type === BoardType.Task) {
      const canView =
        board.isSystem ||
        board.ownerId === user.id ||
        (board.participantIds !== null &&
          (board.participantIds.length === 0 || board.participantIds.includes(user.id)));
      const canEdit = board.ownerId === user.id || user.isAdmin;
      const canDelete = !board.isSystem && (board.ownerId === user.id || user.isAdmin);
      return { canView, canEdit, canDelete };
    }

    return UserRights.none();
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('board')
      .where('board.account_id = :accountId', { accountId: filter.accountId })
      .orderBy('board.sort_order', 'ASC');

    if (filter?.boardId) {
      qb.andWhere('board.id = :boardId', { boardId: filter.boardId });
    }
    if (filter?.type) {
      qb.andWhere('board.type = :type', { type: filter.type });
    }
    if (filter?.recordId) {
      qb.andWhere('board.record_id = :recordId', { recordId: filter.recordId });
    }

    if (filter?.isSystem !== undefined) {
      qb.andWhere('board.is_system = :isSystem', { isSystem: filter.isSystem });
    }

    return qb;
  }

  private async createLinkedTaskBoard({
    accountId,
    user,
    name,
    entityTypeId,
  }: {
    accountId: number;
    user: User;
    name: string;
    entityTypeId: number;
  }): Promise<Board | null> {
    const entityType = await this.entityTypeService.getById(accountId, entityTypeId);

    return entityType.entityCategory === EntityCategory.PROJECT
      ? this.create({ accountId, user, dto: { name, type: BoardType.Task, recordId: null, sortOrder: 1 } })
      : null;
  }

  private async createDefaultStages({ accountId, board }: { accountId: number; board: Board }) {
    if (board.type === BoardType.Task) {
      return this.createTasksStages({ accountId, boardId: board.id });
    } else if (board.type === BoardType.EntityType && board.recordId) {
      const entityType = await this.entityTypeService.getById(accountId, board.recordId);

      switch (entityType.entityCategory) {
        case EntityCategory.DEAL:
        case EntityCategory.CUSTOMER:
          return this.createDealsStages({ accountId, boardId: board.id });
        case EntityCategory.PROJECT:
          return this.createProjectsStages({ accountId, boardId: board.id });
        case EntityCategory.SUPPLIER:
          return this.createSuppliersStages({ accountId, boardId: board.id });
        case EntityCategory.CONTRACTOR:
          return this.createContractorsStages({ accountId, boardId: board.id });
        case EntityCategory.HR:
          return this.createApplicantsStages({ accountId, boardId: board.id });
        default:
          return this.createEntityTypeStages({ accountId, boardId: board.id });
      }
    } else {
      return null;
    }
  }
  private async createTasksStages({ accountId, boardId }: { accountId: number; boardId: number }) {
    return this.stageService.createMany({
      accountId,
      boardId,
      dtos: [
        { name: 'To Do', color: '#555', sortOrder: 0, code: null, isSystem: false },
        { name: 'In Progress', color: '#555', sortOrder: 1, code: null, isSystem: false },
        { name: 'Done', color: '#555', sortOrder: 2, code: BoardStageCode.Done, isSystem: true },
      ],
    });
  }
  private async createDealsStages({ accountId, boardId }: { accountId: number; boardId: number }) {
    return this.stageService.createMany({
      accountId,
      boardId,
      dtos: [
        { name: 'Qualified Lead', color: 'rgb(168, 227, 121)', sortOrder: 0, isSystem: false, code: null },
        { name: 'Contact Made', color: 'rgb(255, 227, 133)', sortOrder: 1, isSystem: false, code: null },
        { name: 'Proposal Made', color: 'rgb(255, 158, 158)', sortOrder: 2, isSystem: false, code: null },
        { name: 'Objections Identified', color: 'rgb(202, 183, 239)', sortOrder: 3, isSystem: false, code: null },
        { name: 'Invoice Sent', color: 'rgb(152, 215, 255)', sortOrder: 4, isSystem: false, code: null },
        { name: 'Closed Won', color: '#50b810', sortOrder: 5, isSystem: true, code: BoardStageCode.Win },
        { name: 'Closed Lost', color: '#ff5a71', sortOrder: 6, isSystem: true, code: BoardStageCode.Lost },
      ],
    });
  }
  private async createProjectsStages({ accountId, boardId }: { accountId: number; boardId: number }) {
    return this.stageService.createMany({
      accountId,
      boardId,
      dtos: [
        { name: 'To Do', color: 'rgb(255, 227, 133)', sortOrder: 0, isSystem: false, code: null },
        { name: 'In progress', color: 'rgb(202, 183, 239)', sortOrder: 1, isSystem: false, code: null },
        { name: 'Completed', color: '#50b810', sortOrder: 2, isSystem: true, code: BoardStageCode.Completed },
      ],
    });
  }
  private async createSuppliersStages({ accountId, boardId }: { accountId: number; boardId: number }) {
    return this.stageService.createMany({
      accountId,
      boardId,
      dtos: [
        { name: 'To Do', color: 'rgb(255, 227, 133)', sortOrder: 0, isSystem: false, code: null },
        { name: 'Request Supplier', color: 'rgb(202, 183, 239)', sortOrder: 1, isSystem: false, code: null },
        { name: 'Negotiate', color: 'rgb(168, 227, 121)', sortOrder: 2, isSystem: false, code: null },
        { name: 'Paid', color: 'rgb(152, 215, 255)', sortOrder: 3, isSystem: false, code: null },
        { name: 'Completed', color: '#50b810', sortOrder: 4, isSystem: true, code: BoardStageCode.Completed },
        { name: 'Not satisfied', color: '#ff5a71', sortOrder: 5, isSystem: true, code: BoardStageCode.NotSatisfied },
      ],
    });
  }
  private async createContractorsStages({ accountId, boardId }: { accountId: number; boardId: number }) {
    return this.stageService.createMany({
      accountId,
      boardId,
      dtos: [
        { name: 'To Do', color: 'rgb(255, 227, 133)', sortOrder: 0, isSystem: false, code: null },
        { name: 'Request Contractor', color: 'rgb(202, 183, 239)', sortOrder: 1, isSystem: false, code: null },
        { name: 'Negotiate', color: 'rgb(168, 227, 121)', sortOrder: 2, isSystem: false, code: null },
        { name: 'Paid', color: 'rgb(152, 215, 255)', sortOrder: 3, isSystem: false, code: null },
        { name: 'Completed', color: '#50b810', sortOrder: 4, isSystem: true, code: BoardStageCode.Completed },
        { name: 'Not satisfied', color: '#ff5a71', sortOrder: 5, isSystem: true, code: BoardStageCode.NotSatisfied },
      ],
    });
  }
  private async createApplicantsStages({ accountId, boardId }: { accountId: number; boardId: number }) {
    return this.stageService.createMany({
      accountId,
      boardId,
      dtos: [
        { name: 'Interview', color: 'rgb(255, 227, 133)', sortOrder: 0, isSystem: false, code: null },
        { name: 'Approved', color: 'rgb(202, 183, 239)', sortOrder: 1, isSystem: false, code: null },
        { name: 'Hired', color: '#50b810', sortOrder: 2, isSystem: true, code: BoardStageCode.Hired },
        { name: 'Rejected', color: '#ff5a71', sortOrder: 3, isSystem: true, code: BoardStageCode.Rejected },
      ],
    });
  }
  public async createEntityTypeStages({ accountId, boardId }: { accountId: number; boardId: number }) {
    return this.stageService.createMany({
      accountId,
      boardId,
      dtos: [
        { name: 'Name your status', color: '#A8E379', sortOrder: 0, isSystem: false, code: null },
        { name: 'Name your status', color: '#FFE385', sortOrder: 1, isSystem: false, code: null },
        { name: 'Name your status', color: '#CAB7EF', sortOrder: 2, isSystem: false, code: null },
        { name: 'Done', color: '#50b810', sortOrder: 3, isSystem: true, code: BoardStageCode.Done },
        { name: 'Not done', color: '#ff5a71', sortOrder: 3, isSystem: true, code: BoardStageCode.NotDone },
      ],
    });
  }
}
