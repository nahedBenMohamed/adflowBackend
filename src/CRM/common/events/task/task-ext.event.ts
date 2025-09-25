import { ServiceEvent } from '@/common';

export class TaskExtEvent extends ServiceEvent {
  externalId?: string | null;
  accountId: number;
  boardId: number;
  taskId?: number | null;

  constructor(data: Omit<TaskExtEvent, 'key' | 'checkHistory'> & { key?: string }) {
    super(data);

    this.externalId = data.externalId;
    this.accountId = data.accountId;
    this.boardId = data.boardId;
    this.taskId = data.taskId;
  }
}
