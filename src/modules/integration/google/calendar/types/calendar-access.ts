import { CalendarAccessDto } from '../dto';
import { CalendarInfo } from './calendar-info';

export class CalendarAccess {
  calendarInfos: CalendarInfo[];
  token: string;

  constructor(data: Omit<CalendarAccess, 'toDto'>) {
    this.calendarInfos = data.calendarInfos;
    this.token = data.token;
  }

  public toDto(): CalendarAccessDto {
    return {
      calendarInfos: this.calendarInfos.map((calendar) => calendar.toDto()),
      token: this.token,
    };
  }
}
