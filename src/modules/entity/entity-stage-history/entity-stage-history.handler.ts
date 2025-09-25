import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CrmEventType, EntityCreatedEvent, EntityEvent } from '@/CRM/common';

import { EntityStageHistoryService } from './entity-stage-history.service';

@Injectable()
export class EntityStageHistoryHandler {
  constructor(private readonly service: EntityStageHistoryService) {}

  @OnEvent(CrmEventType.EntityCreated, { async: true })
  public async onEntityNew(event: EntityCreatedEvent): Promise<void> {
    if (event.boardId && event.stageId) {
      if (event.copiedFrom) {
        this.service.copyHistory(event.accountId, event.copiedFrom, event.entityId);
      } else {
        this.service.create(event.accountId, { ...event });
      }
    }
  }

  @OnEvent(CrmEventType.EntityStageChanged, { async: true })
  public async onEntityStageChanged(event: EntityEvent) {
    if (event.boardId && event.stageId) {
      this.service.create(event.accountId, { ...event });
    }
  }
}
