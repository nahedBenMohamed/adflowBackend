import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { DepartmentDeletedEvent, IamEventType, UserDeletedEvent } from '@/modules/iam/common';

import { SchedulePerformerService } from './schedule-performer.service';

@Injectable()
export class SchedulePerformerHandler {
  constructor(private readonly service: SchedulePerformerService) {}

  @OnEvent(IamEventType.UserDeleted, { async: true })
  public async onUserDeleted(event: UserDeletedEvent) {
    await this.service.deletePerformer({
      accountId: event.accountId,
      userId: event.userId,
      newId: event.newUserId,
    });
  }

  @OnEvent(IamEventType.DepartmentDeleted, { async: true })
  public async onDepartmentDeleted(event: DepartmentDeletedEvent) {
    await this.service.deletePerformer({
      accountId: event.accountId,
      departmentId: event.departmentId,
      newId: event.newDepartmentId,
    });
  }
}
