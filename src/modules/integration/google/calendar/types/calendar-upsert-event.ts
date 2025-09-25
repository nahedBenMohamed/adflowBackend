import { CalendarEvent } from './calendar-event';

export type CalendarEventStatus = 'confirmed' | 'tentative' | 'cancelled';

export interface CalendarUpsertEvent extends CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status?: CalendarEventStatus | null;
  entityId?: number | null;
}
