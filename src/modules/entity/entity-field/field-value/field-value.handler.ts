import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { IamEventType, UserDeletedEvent } from '@/modules/iam/common/events';
import { FieldValueService } from './field-value.service';

@Injectable()
export class FieldValueHandler {
  constructor(private readonly service: FieldValueService) {}

  @OnEvent(IamEventType.UserDeleted, { async: true })
  public async onUserDeleted(event: UserDeletedEvent) {
    await this.service.removeUser(event);
  }
}
