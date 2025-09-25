import { TaskEvent } from './task.event';

export class TaskCreatedEvent extends TaskEvent {
  ownerId: number;
  createdBy: number;
  taskTitle: string;
  taskText: string;
  createdAt: Date;
  startDate: Date | null;
  endDate: Date | null;

  constructor(data: Omit<TaskCreatedEvent, 'key' | 'checkHistory'> & { key?: string }) {
    super(data);

    this.ownerId = data.ownerId;
    this.createdBy = data.createdBy;
    this.taskTitle = data.taskTitle;
    this.taskText = data.taskText;
    this.createdAt = data.createdAt;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
  }
}
