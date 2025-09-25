import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';

import { FileLinkSource, PagingQuery, PagingMeta } from '@/common';
import { Account } from '@/modules/iam/account/entities/account.entity';

import { CrmEventType, TaskCommentCreatedEvent } from '../common';
import { TaskService } from '../task';
import { TaskCommentLikeService } from '../task-comment-like';

import { FileLinkService } from '../Service/FileLink/FileLinkService';

import { CreateTaskCommentDto, TaskCommentResultDto, UpdateTaskCommentDto } from './dto';
import { TaskComment } from './entities';

interface FindFilter {
  accountId: number;
  commentId?: number;
  taskId?: number;
}

@Injectable()
export class TaskCommentService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(TaskComment)
    private readonly repository: Repository<TaskComment>,
    private readonly fileLinkService: FileLinkService,
    private readonly likeService: TaskCommentLikeService,
    private readonly taskService: TaskService,
  ) {}

  public async create({
    account,
    userId,
    taskId,
    dto,
  }: {
    account: Account;
    userId: number;
    taskId: number;
    dto: CreateTaskCommentDto;
  }): Promise<TaskComment> {
    const comment = await this.repository.save(new TaskComment(account.id, userId, dto.text, taskId));

    if (dto.fileIds) {
      await this.fileLinkService.processFiles(account.id, FileLinkSource.TASK_COMMENT, comment.id, dto.fileIds);
    }

    await this.expandOne({ account, comment });

    const task = await this.taskService.findOne({ accountId: account.id, taskId });
    this.eventEmitter.emit(
      CrmEventType.TaskCommentCreated,
      new TaskCommentCreatedEvent({
        source: TaskCommentService.name,
        accountId: account.id,
        taskId: task.id,
        boardId: task.boardId,
        ownerId: task.responsibleUserId,
        entityId: task.entityId ?? null,
        createdBy: userId,
        taskTitle: task.title,
        taskText: task.text,
        createdAt: comment.createdAt,
        startDate: task.startDate,
        endDate: task.endDate,
        taskComment: comment.text,
      }),
    );

    return comment;
  }

  public async findOne(filter: FindFilter): Promise<TaskComment> {
    return this.createFindQb(filter).getOne();
  }
  public async findMany(filter: FindFilter): Promise<TaskComment[]> {
    return this.createFindQb(filter).orderBy('tc.created_at', 'DESC').getMany();
  }

  public async getComments({
    account,
    taskId,
    paging,
  }: {
    account: Account;
    taskId: number;
    paging: PagingQuery;
  }): Promise<TaskCommentResultDto> {
    const qb = this.createFindQb({ accountId: account.id, taskId });
    const comments = await qb.orderBy('tc.created_at', 'DESC').offset(paging.skip).limit(paging.take).getMany();
    await this.expandMany({ account, comments });
    const total = await qb.getCount();

    return { result: comments.map((r) => r.toDto()), meta: new PagingMeta(paging.offset + paging.limit, total) };
  }

  public async update({
    account,
    commentId,
    dto,
  }: {
    account: Account;
    commentId: number;
    dto: UpdateTaskCommentDto;
  }): Promise<TaskComment> {
    await this.repository.update({ accountId: account.id, id: commentId }, { text: dto.text });

    const comment = await this.findOne({ accountId: account.id, commentId });
    await this.expandOne({ account, comment });

    return comment;
  }

  public async delete({ accountId, commentId }: { accountId: number; commentId: number }): Promise<void> {
    await this.repository.delete({ accountId, id: commentId });
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('tc')
      .where('tc.account_id = :accountId', { accountId: filter.accountId });

    if (filter.commentId) {
      qb.andWhere('tc.id = :commentId', { commentId: filter.commentId });
    }
    if (filter.taskId) {
      qb.andWhere('tc.task_id = :taskId', { taskId: filter.taskId });
    }

    return qb;
  }

  private async expandOne({ account, comment }: { account: Account; comment: TaskComment }): Promise<TaskComment> {
    comment.fileLinks = await this.fileLinkService.getFileLinkDtos(account, FileLinkSource.TASK_COMMENT, comment.id);
    comment.likes = await this.likeService.findMany({ accountId: account.id, commentId: comment.id });

    return comment;
  }
  private async expandMany({
    account,
    comments,
  }: {
    account: Account;
    comments: TaskComment[];
  }): Promise<TaskComment[]> {
    return await Promise.all(comments.map((comment) => this.expandOne({ account, comment })));
  }
}
