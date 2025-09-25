import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TaskCommentLikeDto } from '../dto';

@Entity()
export class TaskCommentLike {
  @PrimaryColumn()
  commentId: number;

  @PrimaryColumn()
  userId: number;

  @Column()
  accountId: number;

  constructor(commentId: number, userId: number, accountId: number) {
    this.commentId = commentId;
    this.userId = userId;
    this.accountId = accountId;
  }

  public toDto(): TaskCommentLikeDto {
    return { commentId: this.commentId, userId: this.userId };
  }
}
