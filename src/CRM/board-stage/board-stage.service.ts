import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { NotFoundError } from '@/common';
import { SequenceIdService } from '@/database';

import { BoardStageDeletedEvent, BoardStageEvent, CrmEventType, SequenceName } from '../common';
import { TaskService } from '../task';
import { EntityService } from '../Service/Entity/EntityService';

import { CreateBoardStageDto, UpdateBoardStageDto } from './dto';
import { BoardStage } from './entities';
import { BoardStageCode, BoardStageCodes, BoardStageType } from './enums';
import { GroupedStages } from './types';

interface FindFilter {
  accountId: number;
  stageId?: number;
  boardId?: number | number[];
  includeCodes?: BoardStageCode[];
  excludeCodes?: BoardStageCode[];
  afterStageId?: number;
}

@Injectable()
export class BoardStageService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(BoardStage)
    private readonly repository: Repository<BoardStage>,
    private readonly sequenceIdService: SequenceIdService,
    @Inject(forwardRef(() => EntityService))
    private readonly entityService: EntityService,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
  ) {}

  /**
   * @deprecated
   */
  private async nextIdentity(): Promise<number> {
    return this.sequenceIdService.nextIdentity(SequenceName.Stage);
  }

  async create({
    accountId,
    boardId,
    dto,
  }: {
    accountId: number;
    boardId: number;
    dto: CreateBoardStageDto;
  }): Promise<BoardStage> {
    dto.id ??= await this.nextIdentity();
    if (dto.sortOrder === undefined) {
      const maxSortOrder = await this.createFindQb({ accountId, boardId })
        .select('MAX(stage.sort_order)', 'max')
        .orderBy()
        .getRawOne<{ max: number }>();

      dto.sortOrder = (maxSortOrder?.max ?? 0) + 1;
    }
    const stage = await this.repository.save(BoardStage.fromDto(accountId, boardId, dto));

    this.eventEmitter.emit(
      CrmEventType.BoardStageCreated,
      new BoardStageEvent({ accountId, boardId, stageId: stage.id }),
    );

    return stage;
  }
  async createMany({
    accountId,
    boardId,
    dtos,
  }: {
    accountId: number;
    boardId: number;
    dtos: CreateBoardStageDto[];
  }): Promise<BoardStage[]> {
    return Promise.all(dtos.map((dto) => this.create({ accountId, boardId, dto })));
  }

  async findOne(filter: FindFilter): Promise<BoardStage> {
    return this.createFindQb(filter).getOne();
  }
  async findMany(filter: FindFilter): Promise<BoardStage[]> {
    return this.createFindQb(filter).getMany();
  }

  async findOneId(filter: FindFilter): Promise<number | null> {
    const stage = await this.createFindQb(filter).select('stage.id', 'id').getRawOne<{ id: number }>();

    return stage?.id ?? null;
  }
  async findManyIds(filter: FindFilter): Promise<number[]> {
    const stages = await this.createFindQb(filter).select('stage.id', 'id').getRawMany<{ id: number }>();

    return stages.map((stage) => stage.id);
  }

  async exists(filter: FindFilter): Promise<boolean> {
    return (await this.createFindQb(filter).getCount()) > 0;
  }

  async getGroupedByType({
    accountId,
    entityTypeId,
    boardId,
    type,
  }: {
    accountId: number;
    entityTypeId?: number | number[] | null;
    boardId?: number | number[] | null;
    type?: BoardStageType | null;
  }): Promise<GroupedStages> {
    const qb = this.repository.createQueryBuilder('stage').where('stage.account_id = :accountId', { accountId });
    if (boardId) {
      if (Array.isArray(boardId)) {
        qb.andWhere('stage.board_id IN (:...boardId)', { boardId });
      } else {
        qb.andWhere('stage.board_id = :boardId', { boardId });
      }
    }
    if (entityTypeId) {
      qb.innerJoin('board', 'board', 'board.id = stage.board_id');
      if (Array.isArray(entityTypeId)) {
        qb.andWhere('board.record_id IN (:...entityTypeId)', { entityTypeId });
      } else {
        qb.andWhere('board.record_id = :entityTypeId', { entityTypeId });
      }
    }
    const closed = [...BoardStageCodes.won, ...BoardStageCodes.lost];
    if (type) {
      if (type === BoardStageType.Open) {
        qb.andWhere('(stage.code NOT IN (:...codes) OR stage.code IS NULL)', { codes: closed });
      } else if (type === BoardStageType.Won) {
        qb.andWhere('stage.code IN (:...codes)', { codes: BoardStageCodes.won });
      } else if (type === BoardStageType.Lost) {
        qb.andWhere('stage.code IN (:...codes)', { codes: BoardStageCodes.lost });
      }
    }
    qb.select(`array_agg(stage.id)::int[]`, 'all');
    qb.addSelect(
      `array_agg(stage.id) filter (where stage.code IN (${BoardStageCodes.won.map((c) => `'${c}'`).join(',')}))::int[]`,
      'won',
    );
    qb.addSelect(
      // eslint-disable-next-line max-len
      `array_agg(stage.id) filter (where stage.code IN (${BoardStageCodes.lost.map((c) => `'${c}'`).join(',')}))::int[]`,
      'lost',
    );
    qb.addSelect(
      // eslint-disable-next-line max-len
      `array_agg(stage.id) filter (where stage.code NOT IN (${closed.map((c) => `'${c}'`).join(',')}) OR stage.code IS NULL)::int[]`,
      'open',
    );

    const result = await qb.getRawOne<GroupedStages>();
    return result;
  }

  async update({
    accountId,
    boardId,
    stageId,
    dto,
  }: {
    accountId: number;
    boardId: number;
    stageId: number;
    dto: UpdateBoardStageDto;
  }): Promise<BoardStage> {
    const stage = await this.findOne({ accountId, boardId, stageId });
    if (!stage) {
      throw NotFoundError.withId(BoardStage, stageId);
    }

    await this.repository.save(stage.update(dto));

    this.eventEmitter.emit(
      CrmEventType.BoardStageUpdated,
      new BoardStageEvent({ accountId, boardId, stageId: stage.id }),
    );

    return stage;
  }

  async updateMany({
    accountId,
    boardId,
    dtos,
  }: {
    accountId: number;
    boardId: number;
    dtos: UpdateBoardStageDto[];
  }): Promise<BoardStage[]> {
    return Promise.all(dtos.map((dto) => this.update({ accountId, boardId, stageId: dto.id, dto })));
  }

  async processBatch({
    accountId,
    boardId,
    dtos,
  }: {
    accountId: number;
    boardId: number;
    dtos: (CreateBoardStageDto | UpdateBoardStageDto)[];
  }): Promise<BoardStage[]> {
    //TODO: This is right way to check for created or updated stages. Use this after Frontend refactor.
    // const created = dtos.filter((dto) => !dto['id']).map((dto) => dto as CreateBoardStageDto);
    // const updated = dtos.filter((dto) => dto['id']).map((dto) => dto as UpdateBoardStageDto);
    const created: CreateBoardStageDto[] = [];
    const updated: UpdateBoardStageDto[] = [];
    for (const dto of dtos) {
      if (!dto['id'] || !(await this.exists({ accountId, boardId, stageId: dto['id'] }))) {
        created.push(dto as CreateBoardStageDto);
      } else {
        updated.push(dto as UpdateBoardStageDto);
      }
    }

    const result: BoardStage[] = [];

    result.push(...(await this.createMany({ accountId, boardId, dtos: created })));
    result.push(...(await this.updateMany({ accountId, boardId, dtos: updated })));

    return result;
  }

  async delete({
    accountId,
    boardId,
    stageId,
    newStageId,
  }: {
    accountId: number;
    boardId: number;
    stageId: number;
    newStageId?: number | null;
  }) {
    const stage = await this.findOne({ accountId, boardId, stageId });
    if (!stage) {
      throw NotFoundError.withId(BoardStage, stageId);
    }

    return await this.deleteStage({ stage, newStageId });
  }

  async deleteMany(filter: FindFilter) {
    const stages = await this.findMany(filter);
    for (const stage of stages) {
      await this.deleteStage({ stage });
    }
  }

  private async deleteStage({ stage, newStageId }: { stage: BoardStage; newStageId?: number | null }) {
    if (newStageId) {
      await Promise.all([
        this.entityService.changeStageForAll({
          accountId: stage.accountId,
          boardId: stage.boardId,
          stageId: stage.id,
          newStageId,
        }),
        this.taskService.changeStageForAll({
          accountId: stage.accountId,
          boardId: stage.boardId,
          stageId: stage.id,
          newStageId: newStageId,
        }),
      ]);
    }

    await this.repository.delete(stage.id);

    this.eventEmitter.emit(
      CrmEventType.BoardStageDeleted,
      new BoardStageDeletedEvent({ accountId: stage.accountId, boardId: stage.boardId, stageId: stage.id, newStageId }),
    );

    return stage.id;
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('stage')
      .where('stage.account_id = :accountId', { accountId: filter.accountId })
      .orderBy('stage.sort_order', 'ASC');

    if (filter.stageId) {
      qb.andWhere('stage.id = :stageId', { stageId: filter.stageId });
    }
    if (filter.boardId) {
      if (Array.isArray(filter.boardId)) {
        qb.andWhere('stage.board_id IN (:...boardIds)', { boardIds: filter.boardId });
      } else {
        qb.andWhere('stage.board_id = :boardId', { boardId: filter.boardId });
      }
    }
    if (filter.includeCodes) {
      qb.andWhere('stage.code IN (:...includeCodes)', { includeCodes: filter.includeCodes });
    }
    if (filter.excludeCodes) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('stage.code NOT IN (:...excludeCodes)', { excludeCodes: filter.excludeCodes }).orWhere(
            'code IS NULL',
          );
        }),
      );
    }
    if (filter.afterStageId) {
      qb.innerJoin(
        (subQuery) => {
          return subQuery
            .select('s.id', 'id')
            .addSelect('s.sort_order', 'sort_order')
            .from('stage', 's')
            .where('s.id = :afterStageId', { afterStageId: filter.afterStageId });
        },
        'after_stage',
        'stage.sort_order > after_stage.sort_order',
      );
    }

    return qb;
  }
}
