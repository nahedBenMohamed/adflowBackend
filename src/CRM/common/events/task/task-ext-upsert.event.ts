import { TaskExtEvent } from './task-ext.event';

export class TaskExtUpsertEvent extends TaskExtEvent {
  ownerId: number;
  title: string;
  text?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;

  constructor(data: Omit<TaskExtUpsertEvent, 'key' | 'checkHistory'> & { key?: string }) {
    super(data);

    this.ownerId = data.ownerId;
    this.title = data.title;
    this.text = data.text;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
  }
}
