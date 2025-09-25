import { TaskCreatedEvent } from './task-created.event';

export class TaskUpdatedEvent extends TaskCreatedEvent {
  prevEntityId: number | null;

  constructor(data: Omit<TaskUpdatedEvent, 'key' | 'checkHistory'> & { key?: string }) {
    super(data);

    this.prevEntityId = data.prevEntityId;
  }
}
