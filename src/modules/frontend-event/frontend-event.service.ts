import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { UserNotification } from '@/common';
import {
  ChatEvent,
  ChatMessageCreatedEvent,
  ChatMessageUpdatedEvent,
  MultichatEventType,
} from '@/modules/multichat/common';
import { NotificationEventType, NotificationUnseenEvent } from '@/modules/notification/common';
import { ScheduleEvent, SchedulerEventType } from '@/modules/scheduler/common';
import { ActivityEvent, CrmEventType, EntityCreatedEvent, EntityEvent, TaskEvent } from '@/CRM/common';

import { FrontendEventGateway } from './frontend-event.gateway';

@Injectable()
export class FrontendEventService {
  constructor(private readonly gateway: FrontendEventGateway) {}

  @OnEvent(NotificationEventType.NOTIFICATION_CREATED, { async: true })
  public async onNotificationCreated(event: { userId?: number }) {
    if (event?.userId) {
      this.gateway.notifyUser(event.userId, NotificationEventType.NOTIFICATION_CREATED, event);
    }
  }

  @OnEvent(NotificationEventType.NOTIFICATION_UNSEEN, { async: true })
  public async onNotificationUnseen(event: NotificationUnseenEvent) {
    this.gateway.notifyUser(event.userId, NotificationEventType.NOTIFICATION_UNSEEN, event.unseenCount);
  }

  @OnEvent(CrmEventType.TaskCreated, { async: true })
  public async onTaskCreated(event: TaskEvent) {
    this.gateway.notifyAccount(event.accountId, CrmEventType.TaskCreated, event.taskId);
  }

  @OnEvent(CrmEventType.TaskUpdated, { async: true })
  public async onTaskUpdated(event: TaskEvent) {
    this.gateway.notifyAccount(event.accountId, CrmEventType.TaskUpdated, event.taskId);
  }

  @OnEvent(CrmEventType.TaskDeleted, { async: true })
  public async onTaskDeleted(event: TaskEvent) {
    this.gateway.notifyAccount(event.accountId, CrmEventType.TaskDeleted, event.taskId);
  }

  @OnEvent(CrmEventType.ActivityCreated, { async: true })
  public async onActivityCreated(event: ActivityEvent) {
    this.gateway.notifyAccount(event.accountId, CrmEventType.ActivityCreated, event.activityId);
  }

  @OnEvent(CrmEventType.ActivityUpdated, { async: true })
  public async onActivityUpdated(event: ActivityEvent) {
    this.gateway.notifyAccount(event.accountId, CrmEventType.ActivityUpdated, event.activityId);
  }

  @OnEvent(CrmEventType.ActivityDeleted, { async: true })
  public async onActivityDeleted(event: ActivityEvent) {
    this.gateway.notifyAccount(event.accountId, CrmEventType.ActivityDeleted, event.activityId);
  }

  @OnEvent(CrmEventType.EntityCreated, { async: true })
  public async onEntityCreated(event: EntityCreatedEvent) {
    if (event.userNotification !== UserNotification.Suppressed) {
      this.gateway.notifyAccount(event.accountId, CrmEventType.EntityCreated, event);
    }
  }

  @OnEvent(CrmEventType.EntityUpdated, { async: true })
  public async onEntityUpdated(event: EntityEvent) {
    if (event.userNotification !== UserNotification.Suppressed) {
      this.gateway.notifyAccount(event.accountId, CrmEventType.EntityUpdated, event);
    }
  }

  @OnEvent(CrmEventType.EntityDeleted, { async: true })
  public async onEntityDeleted(event: EntityEvent) {
    if (event.userNotification !== UserNotification.Suppressed) {
      this.gateway.notifyAccount(event.accountId, CrmEventType.EntityDeleted, event);
    }
  }

  @OnEvent(MultichatEventType.ChatCreated, { async: true })
  public async onChatCreated(event: ChatEvent) {
    this.gateway.notifyUser(event.userId, MultichatEventType.ChatCreated, event);
  }
  @OnEvent(MultichatEventType.ChatUpdated, { async: true })
  public async onChatUpdated(event: ChatEvent) {
    this.gateway.notifyUser(event.userId, MultichatEventType.ChatUpdated, event);
  }
  @OnEvent(MultichatEventType.ChatDeleted, { async: true })
  public async onChatDeleted(event: ChatEvent) {
    this.gateway.notifyUser(event.userId, MultichatEventType.ChatDeleted, event);
  }

  @OnEvent(MultichatEventType.ChatMessageCreated, { async: true })
  public async onChatMessageCreated(event: ChatMessageCreatedEvent) {
    this.gateway.notifyUser(event.userId, MultichatEventType.ChatMessageCreated, event);
  }
  @OnEvent(MultichatEventType.ChatMessageUpdated, { async: true })
  public async onChatMessageUpdated(event: ChatMessageUpdatedEvent) {
    this.gateway.notifyUser(event.userId, MultichatEventType.ChatMessageUpdated, event);
  }
  @OnEvent(MultichatEventType.ChatMessageDeleted, { async: true })
  public async onChatMessageDeleted(event: ChatMessageUpdatedEvent) {
    this.gateway.notifyUser(event.userId, MultichatEventType.ChatMessageDeleted, event);
  }

  @OnEvent(SchedulerEventType.ScheduleCreated, { async: true })
  public async onScheduleCreated(event: ScheduleEvent) {
    this.gateway.notifyAccount(event.accountId, SchedulerEventType.ScheduleCreated, event);
  }
  @OnEvent(SchedulerEventType.ScheduleUpdated, { async: true })
  public async onScheduleUpdated(event: ScheduleEvent) {
    this.gateway.notifyAccount(event.accountId, SchedulerEventType.ScheduleUpdated, event);
  }
  @OnEvent(SchedulerEventType.ScheduleDeleted, { async: true })
  public async onScheduleDeleted(event: ScheduleEvent) {
    this.gateway.notifyAccount(event.accountId, SchedulerEventType.ScheduleDeleted, event);
  }
}
