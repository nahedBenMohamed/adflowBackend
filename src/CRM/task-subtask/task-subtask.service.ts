import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotFoundError } from '@/common';

import { TaskSubtask } from './entities';
import { CreateTaskSubtaskDto, UpdateTaskSubtaskDto } from './dto';

interface FindFilter {
  taskId?: number;
  subtaskId?: number | number[];
}

@Injectable()
export class TaskSubtaskService {
  constructor(
    @InjectRepository(TaskSubtask)
    private readonly repository: Repository<TaskSubtask>,
  ) {}

  public async create(accountId: number, taskId: number, dto: CreateTaskSubtaskDto): Promise<TaskSubtask> {
    return this.repository.save(TaskSubtask.fromDto(accountId, taskId, dto));
  }

  public async createMany(accountId: number, taskId: number, dtos: CreateTaskSubtaskDto[]): Promise<TaskSubtask[]> {
    return Promise.all(dtos.map((dto) => this.create(accountId, taskId, dto)));
  }

  public async findOne(accountId: number, filter?: FindFilter): Promise<TaskSubtask> {
    return this.createFindQb(accountId, filter).getOne();
  }

  public async findMany(accountId: number, filter?: FindFilter): Promise<TaskSubtask[]> {
    return this.createFindQb(accountId, filter).orderBy('sort_order', 'ASC').getMany();
  }

  public async getCount(accountId: number, filter?: FindFilter): Promise<number> {
    return this.createFindQb(accountId, filter).getCount();
  }

  public async update(
    accountId: number,
    taskId: number,
    subtaskId: number,
    dto: UpdateTaskSubtaskDto,
  ): Promise<TaskSubtask> {
    const subtask = await this.findOne(accountId, { taskId, subtaskId });
    if (!subtask) {
      throw NotFoundError.withId(TaskSubtask, subtaskId);
    }

    return this.repository.save(subtask.update(dto));
  }

  public async updateMany(accountId: number, taskId: number, dtos: UpdateTaskSubtaskDto[]): Promise<TaskSubtask[]> {
    return Promise.all(dtos.map((dto) => this.update(accountId, taskId, dto.id, dto)));
  }

  public async processBatch(
    accountId: number,
    taskId: number,
    dtos: (CreateTaskSubtaskDto | UpdateTaskSubtaskDto)[],
  ): Promise<TaskSubtask[]> {
    const subtasks = await this.findMany(accountId, { taskId });

    const created = dtos.filter((dto) => !dto['id']).map((dto) => dto as CreateTaskSubtaskDto);
    const updated = dtos.filter((dto) => dto['id']).map((dto) => dto as UpdateTaskSubtaskDto);
    const deleted = subtasks.filter((f) => !updated.some((dto) => dto.id === f.id)).map((f) => f.id);

    const result: TaskSubtask[] = [];

    result.push(...(await this.createMany(accountId, taskId, created)));
    result.push(...(await this.updateMany(accountId, taskId, updated)));

    if (deleted.length) {
      await this.delete(accountId, taskId, deleted);
    }

    return result;
  }

  public async delete(accountId: number, taskId: number, subtaskId: number | number[]): Promise<void> {
    await this.createFindQb(accountId, { taskId, subtaskId }).delete().execute();
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder().where('account_id = :accountId', { accountId });

    if (filter?.taskId) {
      qb.andWhere('task_id = :taskId', { taskId: filter.taskId });
    }

    if (filter?.subtaskId) {
      if (Array.isArray(filter.subtaskId)) {
        qb.andWhere('id IN (:...ids)', { ids: filter.subtaskId });
      } else {
        qb.andWhere('id = :id', { id: filter.subtaskId });
      }
    }

    return qb;
  }
}
