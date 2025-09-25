import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { FileLinkDto } from '../../Service/FileLink/FileLinkDto';
import { TaskCommentLike } from '../../task-comment-like';
import { TaskCommentDto } from '../dto';

@Entity()
export class TaskComment {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  text: string;

  @Column()
  taskId: number;

  @Column()
  createdBy: number;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(accountId: number, createdBy: number, text: string, taskId: number, createdAt?: Date) {
    this.accountId = accountId;
    this.createdBy = createdBy;
    this.text = text;
    this.taskId = taskId;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  private _fileLinks: FileLinkDto[] | null;
  public get fileLinks(): FileLinkDto[] | null {
    return this._fileLinks;
  }
  public set fileLinks(value: FileLinkDto[] | null) {
    this._fileLinks = value;
  }
  private _likes: TaskCommentLike[] | null;
  public get likes(): TaskCommentLike[] | null {
    return this._likes;
  }
  public set likes(value: TaskCommentLike[] | null) {
    this._likes = value;
  }

  public toDto(): TaskCommentDto {
    return {
      id: this.id,
      taskId: this.taskId,
      createdBy: this.createdBy,
      text: this.text,
      createdAt: this.createdAt.toISOString(),
      fileLinks: this.fileLinks ?? [],
      likedUserIds: this.likes ? this.likes.map((l) => l.userId) : [],
    };
  }
}
