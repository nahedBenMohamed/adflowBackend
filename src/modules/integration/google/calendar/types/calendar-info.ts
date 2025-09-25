import { calendar_v3 } from 'googleapis';
import { CalendarInfoDto } from '../dto';

export class CalendarInfo {
  id: string;
  title: string;
  primary: boolean;
  readonly: boolean;
  description?: string;
  timeZone?: string;
  color?: string;

  constructor(data: Omit<CalendarInfo, 'toDto'>) {
    this.id = data.id;
    this.title = data.title;
    this.primary = data.primary;
    this.readonly = data.readonly;
    this.description = data.description;
    this.timeZone = data.timeZone;
    this.color = data.color;
  }

  static fromApi(calendar: calendar_v3.Schema$CalendarListEntry): CalendarInfo {
    return new CalendarInfo({
      id: calendar.id,
      title: calendar.summary,
      primary: calendar.primary ?? false,
      readonly: !['owner', 'writer'].includes(calendar.accessRole ?? ''),
      description: calendar.description,
      timeZone: calendar.timeZone,
      color: calendar.backgroundColor,
    });
  }

  toDto(): CalendarInfoDto {
    return {
      id: this.id,
      title: this.title,
      primary: this.primary,
      readonly: this.readonly,
      description: this.description,
      timeZone: this.timeZone,
      color: this.color,
    };
  }
}
