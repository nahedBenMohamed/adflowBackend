import { calendar_v3 } from 'googleapis';

import { CalendarType } from '../enums';
import { CalendarEvent, EventExtendedProperties } from '../types';

export class EventUtil {
  public static createExternalId(event: calendar_v3.Schema$Event): string {
    return event.iCalUID ?? `${event.id}@google.com`;
  }

  public static getExtendedProperties(event: CalendarEvent): EventExtendedProperties {
    return {
      shared: {
        accountId: event.accountId.toString(),
        ownerId: event.ownerId?.toString(),
        objectId: event.objectId.toString(),
        eventId: event.eventId.toString(),
        type: event.type,
      },
    };
  }

  public static getCalendarEvent(event: calendar_v3.Schema$Event): CalendarEvent {
    const accountId = event.extendedProperties?.shared?.['accountId'];
    const ownerId = event.extendedProperties?.shared?.['ownerId'];
    const objectId = event.extendedProperties?.shared?.['objectId'];
    const eventId = event.extendedProperties?.shared?.['eventId'];
    const type = event.extendedProperties?.shared?.['type'] as CalendarType;

    return {
      accountId: accountId ? Number(accountId) : null,
      ownerId: ownerId ? Number(ownerId) : null,
      objectId: objectId ? Number(objectId) : null,
      eventId: eventId ? Number(eventId) : null,
      type: type ?? null,
      externalId: EventUtil.createExternalId(event),
    };
  }

  public static getEventDate(date: calendar_v3.Schema$EventDateTime): Date | undefined {
    const d = date.dateTime || date.date;

    return d ? new Date(d) : undefined;
  }
}
