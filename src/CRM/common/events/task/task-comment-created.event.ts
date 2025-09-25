import { TaskCreatedEvent } from './task-created.event';

export class TaskCommentCreatedEvent extends TaskCreatedEvent {
  taskComment: string;

  constructor(data: Omit<TaskCommentCreatedEvent, 'key' | 'checkHistory'> & { key?: string }) {
    super(data);

    this.taskComment = data.taskComment;
  }
}
