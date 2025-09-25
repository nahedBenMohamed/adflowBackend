import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { BoardEvent, CrmEventType, EntityTypeEvent } from '@/CRM/common';

import { TaskSettingsType } from './enums/task-settings-type.enum';
import { TaskSettingsService } from './task-settings.service';

@Injectable()
export class TaskSettingsHandler {
  constructor(private readonly service: TaskSettingsService) {}

  @OnEvent(CrmEventType.EntityTypeDeleted, { async: true })
  public async onEntityTypeDeleted(event: EntityTypeEvent) {
    await this.service.delete(event.accountId, event.entityTypeId, TaskSettingsType.EntityType);
  }

  @OnEvent(CrmEventType.BoardDeleted, { async: true })
  public async onBoardDeleted(event: BoardEvent) {
    await this.service.delete(event.accountId, event.boardId, TaskSettingsType.TaskBoard);
  }
}
