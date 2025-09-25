import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CrmEventType, EntityCreatedEvent } from '../common';
import { NoteService } from './note.service';

@Injectable()
export class NoteHandler {
  constructor(private readonly service: NoteService) {}

  @OnEvent(CrmEventType.EntityCreated, { async: true })
  async onEntityCreated(event: EntityCreatedEvent): Promise<void> {
    if (event.copiedFrom) {
      await this.service.copyEntityNotes({
        accountId: event.accountId,
        sourceEntityId: event.copiedFrom,
        targetEntityId: event.entityId,
      });
    }
  }
}
