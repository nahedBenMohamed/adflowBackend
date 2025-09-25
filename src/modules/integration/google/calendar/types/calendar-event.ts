import { CalendarType } from '../enums';

export interface CalendarEvent {
  accountId: number | null;
  ownerId?: number | null;
  objectId: number | null;
  eventId: number | null;
  type: CalendarType | null;
  externalId: string | null;
}
