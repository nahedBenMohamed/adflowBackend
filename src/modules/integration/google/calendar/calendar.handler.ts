import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';

import { IamEventType, UserDeletedEvent } from '@/modules/iam/common';
import {
  ScheduleEvent,
  SchedulePerformerDeletedEvent,
  SchedulerAppointmentCreatedEvent,
  SchedulerAppointmentEvent,
  SchedulerAppointmentUpdatedEvent,
  SchedulerEventType,
} from '@/modules/scheduler/common';
import { BoardEvent, CrmEventType, TaskCreatedEvent, TaskEvent, TaskUpdatedEvent } from '@/CRM/common';

import { GoogleCalendar } from './entities';
import { CalendarType } from './enums';
import { AppointmentUtil } from './utils';
import { CalendarService } from './calendar.service';

@Injectable()
export class CalendarHandler {
  private readonly logger = new Logger(CalendarHandler.name);
  constructor(private readonly service: CalendarService) {}

  @Cron(CronExpression.EVERY_HOUR)
  public async synchronizeActive() {
    if (process.env.SCHEDULE_INTEGRATION_GOOGLE_CALENDAR_DISABLE === 'true') return;
    this.logger.log('Before: Renew registered Google Calendar channels');
    const count = await this.service.renewChannels();
    this.logger.log(`After: Renew registered Google Calendar channels. Processed: ${count}`);
  }

  @OnEvent(CrmEventType.TaskCreated, { async: true })
  public async onTaskCreated(event: TaskCreatedEvent) {
    if (!event.checkHistory({ source: GoogleCalendar.name })) {
      if (event.startDate && event.endDate) {
        this.service.handleUpsert({
          accountId: event.accountId,
          ownerId: event.ownerId,
          objectId: event.boardId,
          eventId: event.taskId,
          type: CalendarType.Task,
          title: event.taskTitle,
          description: event.taskText,
          startDate: event.startDate,
          endDate: event.endDate,
          entityId: event.entityId,
          externalId: event.externalId,
        });
      }
    }
  }

  @OnEvent(CrmEventType.TaskUpdated, { async: true })
  public async onTaskUpdated(event: TaskUpdatedEvent) {
    if (!event.checkHistory({ source: GoogleCalendar.name })) {
      if (event.startDate && event.endDate) {
        this.service.handleUpsert({
          accountId: event.accountId,
          ownerId: event.ownerId,
          objectId: event.boardId,
          eventId: event.taskId,
          type: CalendarType.Task,
          title: event.taskTitle,
          description: event.taskText,
          startDate: event.startDate,
          endDate: event.endDate,
          entityId: event.entityId,
          externalId: event.externalId,
        });
      }
    }
  }

  @OnEvent(CrmEventType.TaskDeleted, { async: true })
  public async onTaskDeleted(event: TaskEvent) {
    if (!event.checkHistory({ source: GoogleCalendar.name })) {
      this.service.handleDeleted({
        accountId: event.accountId,
        objectId: event.boardId,
        eventId: event.taskId,
        type: CalendarType.Task,
        externalId: event.externalId,
      });
    }
  }

  @OnEvent(SchedulerEventType.ScheduleAppointmentCreated, { async: true })
  public async onScheduleAppointmentCreated(event: SchedulerAppointmentCreatedEvent) {
    if (!event.checkHistory({ source: GoogleCalendar.name })) {
      if (event.startDate && event.endDate) {
        this.service.handleUpsert({
          accountId: event.accountId,
          ownerId: event.performerId,
          objectId: event.scheduleId,
          eventId: event.appointmentId,
          type: CalendarType.Schedule,
          title: event.title,
          description: event.comment,
          startDate: event.startDate,
          endDate: event.endDate,
          status: AppointmentUtil.convertAppointmentStatus(event.status),
          entityId: event.entityId,
          externalId: event.externalId,
        });
      }
    }
  }

  @OnEvent(SchedulerEventType.ScheduleAppointmentUpdated, { async: true })
  public async onScheduleAppointmentUpdated(event: SchedulerAppointmentUpdatedEvent) {
    if (!event.checkHistory({ source: GoogleCalendar.name })) {
      if (event.startDate && event.endDate) {
        this.service.handleUpsert({
          accountId: event.accountId,
          ownerId: event.performerId,
          objectId: event.scheduleId,
          eventId: event.appointmentId,
          type: CalendarType.Schedule,
          title: event.title,
          description: event.comment,
          startDate: event.startDate,
          endDate: event.endDate,
          status: AppointmentUtil.convertAppointmentStatus(event.status),
          entityId: event.entityId,
          externalId: event.externalId,
        });
      }
    }
  }

  @OnEvent(SchedulerEventType.ScheduleAppointmentDeleted, { async: true })
  public async onScheduleAppointmentDeleted(event: SchedulerAppointmentEvent) {
    if (!event.checkHistory({ source: GoogleCalendar.name })) {
      this.service.handleDeleted({
        accountId: event.accountId,
        objectId: event.scheduleId,
        eventId: event.appointmentId,
        type: CalendarType.Schedule,
        externalId: event.externalId,
      });
    }
  }

  @OnEvent(IamEventType.UserDeleted, { async: true })
  public async onUserDeleted(event: UserDeletedEvent) {
    await this.service.handleDeleteByResponsible({
      accountId: event.accountId,
      type: CalendarType.Task,
      responsibleId: event.userId,
      newResponsibleId: event.newUserId,
    });
  }

  @OnEvent(CrmEventType.BoardDeleted, { async: true })
  public async onBoardDeleted(event: BoardEvent) {
    this.service.handleDeleteByObject({ accountId: event.accountId, type: CalendarType.Task, objectId: event.boardId });
  }

  @OnEvent(SchedulerEventType.ScheduleDeleted, { async: true })
  public async onScheduleDeleted(event: ScheduleEvent) {
    await this.service.handleDeleteByObject({
      accountId: event.accountId,
      type: CalendarType.Schedule,
      objectId: event.scheduleId,
    });
  }

  @OnEvent(SchedulerEventType.SchedulePerformerDeleted, { async: true })
  public async onSchedulePerformerDeleted(event: SchedulePerformerDeletedEvent) {
    await this.service.handleDeleteByResponsible({
      accountId: event.accountId,
      type: CalendarType.Schedule,
      responsibleId: event.performerId,
      newResponsibleId: event.newPerformerId,
    });
  }
}
