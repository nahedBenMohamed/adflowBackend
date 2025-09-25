import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { DepartmentDeletedEvent, IamEventType } from '../common';
import { UserService } from './user.service';

@Injectable()
export class UserHandler {
  constructor(private readonly service: UserService) {}

  @OnEvent(IamEventType.DepartmentDeleted, { async: true })
  public async onDepartmentDeleted(event: DepartmentDeletedEvent) {
    await this.service.changeDepartment({
      accountId: event.accountId,
      departmentId: event.departmentId,
      newDepartmentId: event.newDepartmentId,
    });
  }
}
