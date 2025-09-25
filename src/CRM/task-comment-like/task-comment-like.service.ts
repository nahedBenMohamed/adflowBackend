import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TaskCommentLike } from './entities';

interface FindFilter {
  accountId: number;
  commentId?: number;
  userId?: number;
}

export class TaskCommentLikeService {
  constructor(
    @InjectRepository(TaskCommentLike)
    private readonly repository: Repository<TaskCommentLike>,
  ) {}

  public async like({
    accountId,
    commentId,
    userId,
  }: {
    accountId: number;
    commentId: number;
    userId: number;
  }): Promise<TaskCommentLike> {
    return this.repository.save(new TaskCommentLike(commentId, userId, accountId));
  }

  public async unlike({ accountId, commentId, userId }: { accountId: number; commentId: number; userId: number }) {
    await this.repository.delete({ accountId, commentId, userId });
  }

  public async findMany({ accountId, commentId, userId }: FindFilter): Promise<TaskCommentLike[]> {
    const qb = this.repository.createQueryBuilder('tcl').where('tcl.account_id = :accountId', { accountId });

    if (commentId) {
      qb.andWhere('tcl.comment_id = :commentId', { commentId });
    }
    if (userId) {
      qb.andWhere('tcl.user_id = :userId', { userId });
    }

    return qb.getMany();
  }
}
