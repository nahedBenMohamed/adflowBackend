import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { calendar_v3 } from 'googleapis';

import { ServiceEvent } from '@/common';
import { SchedulerAppointmentExtUpsertEvent, SchedulerEventType } from '@/modules/scheduler/common';
import { CrmEventType, TaskExtEvent, TaskExtUpsertEvent } from '@/CRM/common';

import { GoogleCalendar } from './entities';
import { CalendarType } from './enums';
import { CalendarEvent } from './types';
import { AppointmentUtil, EventUtil } from './utils';

@Injectable()
export class CalendarEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  public async emit({ calendar, event }: { calendar: GoogleCalendar; event: calendar_v3.Schema$Event }) {
    const calendarEvent = EventUtil.getCalendarEvent(event);
    const objectIds = [calendar.objectId, ...(calendar.linked?.map((linked) => linked.objectId) ?? [])];
    if (!calendarEvent.objectId || !objectIds.includes(calendarEvent.objectId)) {
      calendarEvent.objectId = null;
      calendarEvent.eventId = null;
    }

    const eventType = this.getEventType({ calendar, event });
    const eventData = this.getEventData({ calendar, event, calendarEvent });

    this.eventEmitter.emit(eventType, eventData);
  }

  private getEventType({ calendar, event }: { calendar: GoogleCalendar; event: calendar_v3.Schema$Event }): string {
    switch (calendar.type) {
      case CalendarType.Task:
        return event.status === 'cancelled' ? CrmEventType.TaskDeleteExt : CrmEventType.TaskUpsertExt;
      case CalendarType.Schedule:
        return SchedulerEventType.ScheduleAppointmentUpsertExt;
    }
  }

  private getEventData({
    calendar,
    event,
    calendarEvent,
  }: {
    calendar: GoogleCalendar;
    event: calendar_v3.Schema$Event;
    calendarEvent: CalendarEvent;
  }): ServiceEvent {
    switch (calendar.type) {
      case CalendarType.Task:
        return this.getEventDataTask({ calendar, event, calendarEvent });
      case CalendarType.Schedule:
        return this.getEventDataSchedule({ calendar, event, calendarEvent });
    }
  }

  private getEventDataTask({
    calendar,
    event,
    calendarEvent,
  }: {
    calendar: GoogleCalendar;
    event: calendar_v3.Schema$Event;
    calendarEvent: CalendarEvent;
  }): ServiceEvent {
    const startDate = EventUtil.getEventDate(event.start);
    const endDate = EventUtil.getEventDate(event.end);

    return event.status === 'cancelled'
      ? new TaskExtEvent({
          source: GoogleCalendar.name,
          externalId: calendarEvent.externalId,
          accountId: calendar.accountId,
          boardId: calendarEvent.objectId ?? calendar.objectId,
          taskId: calendarEvent.eventId,
        })
      : new TaskExtUpsertEvent({
          source: GoogleCalendar.name,
          externalId: calendarEvent.externalId,
          accountId: calendar.accountId,
          boardId: calendarEvent.objectId ?? calendar.objectId,
          taskId: calendarEvent.eventId,
          ownerId: calendar.responsibleId,
          title: event.summary,
          text: event.description,
          startDate,
          endDate,
        });
  }

  private getEventDataSchedule({
    calendar,
    event,
    calendarEvent,
  }: {
    calendar: GoogleCalendar;
    event: calendar_v3.Schema$Event;
    calendarEvent: CalendarEvent;
  }): ServiceEvent {
    const startDate = EventUtil.getEventDate(event.start);
    const endDate = EventUtil.getEventDate(event.end);

    return new SchedulerAppointmentExtUpsertEvent({
      source: GoogleCalendar.name,
      externalId: calendarEvent.externalId,
      accountId: calendar.accountId,
      scheduleId: calendarEvent.objectId ?? calendar.objectId,
      appointmentId: calendarEvent.eventId,
      performerId: calendar.responsibleId,
      ownerId: calendar.createdBy,
      title: event.summary,
      comment: event.description,
      startDate,
      endDate,
      status: AppointmentUtil.convertEventStatus(event.status),
    });
  }
}
