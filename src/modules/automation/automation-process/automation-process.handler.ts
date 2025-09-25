import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JSONDoc } from '@camunda8/sdk/dist/zeebe/types';

import { IamEventType, UserDeletedEvent } from '@/modules/iam/common';

import { AutomationEventType, ProcessStartEvent, SendMessageEvent, SendSignalEvent } from '../common';
import { AutomationProcessService } from './automation-process.service';

@Injectable()
export class AutomationProcessHandler {
  constructor(private readonly service: AutomationProcessService) {}

  @OnEvent(AutomationEventType.SendSignal, { async: true })
  public async handleSendSignal(event: SendSignalEvent) {
    await this.service.sendSignal({ accountId: event.accountId, signal: event.signal });
  }

  @OnEvent(AutomationEventType.SendMessage, { async: true })
  public async handleSendMessage(event: SendMessageEvent) {
    await this.service.sendMessage({ accountId: event.accountId, message: event.message });
  }

  @OnEvent(IamEventType.UserDeleted, { async: true })
  public async onUserDeleted(event: UserDeletedEvent) {
    if (event.newUserId) {
      await this.service.changeOwner({
        accountId: event.accountId,
        currentUserId: event.userId,
        newUserId: event.newUserId,
      });
    } else {
      await this.service.deleteMany({ accountId: event.accountId, createdBy: event.userId });
    }
  }

  @OnEvent(AutomationEventType.ProcessStart, { async: true })
  public async handleProcessStart<V extends JSONDoc>(event: ProcessStartEvent<V>) {
    await this.service.processStart({
      accountId: event.accountId,
      processId: event.processId,
      variables: event.variables,
    });
  }
}
