import { ServiceEvent } from '@/common';

export class TaskEvent extends ServiceEvent {
  accountId: number;
  taskId: number;
  boardId: number;
  entityId?: number | null;
  externalId?: string | null;

  constructor(data: Omit<TaskEvent, 'key' | 'checkHistory'> & { key?: string }) {
    super(data);

    this.accountId = data.accountId;
    this.taskId = data.taskId;
    this.boardId = data.boardId;
    this.entityId = data.entityId;
    this.externalId = data.externalId;
  }
}
