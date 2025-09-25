import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { IamEventType, UserDeletedEvent } from '@/modules/iam/common';

import { CrmEventType, EntityTypeEvent } from '../common';
import { BoardService } from './board.service';

@Injectable()
export class BoardHandler {
  constructor(private readonly service: BoardService) {}

  @OnEvent(IamEventType.UserDeleted, { async: true })
  public async onUserDeleted(event: UserDeletedEvent) {
    await this.service.changeUser({ accountId: event.accountId, userId: event.userId, newUserId: event.newUserId });
  }

  @OnEvent(CrmEventType.EntityTypeDeleted, { async: true })
  public async onEntityTypeDeleted(event: EntityTypeEvent): Promise<void> {
    this.service.deleteMany({
      userId: event.userId,
      filter: { accountId: event.accountId, recordId: event.entityTypeId },
    });
  }
}
