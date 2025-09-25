import * as FNS from 'date-fns';

import { isUnique } from './array.util';

type UnitOfTime = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

const WeekDaysNames = {
  en: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
};

type FormatPresets = 'date' | 'time' | 'dateAndTime';
const Formats: Record<FormatPresets, string> = {
  date: 'dd.MM.yyyy',
  time: 'HH:mm:ss',
  dateAndTime: 'dd.MM.yyyy HH:mm:ss',
};

export class DateUtil {
  static now(): Date {
    return new Date();
  }

  static fromISOString(dateStr: string | null): Date | null {
    return dateStr ? new Date(dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`) : null;
  }

  static parse(date: string, format: string): Date {
    return FNS.parse(date, format, DateUtil.now());
  }

  static format(date: Date, formatStr: string, options?: FNS.FormatOptions): string {
    return FNS.format(date, formatStr, options);
  }
  static formatPreset(date: Date, preset: FormatPresets): string {
    return FNS.format(date, Formats[preset]);
  }

  static add(date: Date, duration: FNS.Duration): Date {
    return FNS.add(date, duration);
  }
  static sub(date: Date, duration: FNS.Duration): Date {
    return FNS.sub(date, duration);
  }

  static startOf(date: Date, unit: UnitOfTime): Date {
    const isoCorrection = date.getTimezoneOffset();
    switch (unit) {
      case 'second':
        return FNS.startOfSecond(date);
      case 'minute':
        return FNS.startOfMinute(date);
      case 'hour':
        return FNS.startOfHour(date);
      case 'day':
        return FNS.subMinutes(FNS.startOfDay(date), isoCorrection);
      case 'week':
        //TODO: add settings for week start
        return FNS.subMinutes(FNS.startOfWeek(date, { weekStartsOn: 1 }), isoCorrection);
      case 'month':
        return FNS.subMinutes(FNS.startOfMonth(date), isoCorrection);
      case 'quarter':
        return FNS.subMinutes(FNS.startOfQuarter(date), isoCorrection);
      case 'year':
        return FNS.subMinutes(FNS.startOfYear(date), isoCorrection);
    }
  }
  static endOf(date: Date, unit: UnitOfTime): Date {
    const isoCorrection = date.getTimezoneOffset();
    switch (unit) {
      case 'second':
        return FNS.endOfSecond(date);
      case 'minute':
        return FNS.endOfMinute(date);
      case 'hour':
        return FNS.endOfHour(date);
      case 'day':
        return FNS.subMinutes(FNS.endOfDay(date), isoCorrection);
      case 'week':
        //TODO: add settings for week start
        return FNS.subMinutes(FNS.endOfWeek(date, { weekStartsOn: 1 }), isoCorrection);
      case 'month':
        return FNS.subMinutes(FNS.endOfMonth(date), isoCorrection);
      case 'quarter':
        return FNS.subMinutes(FNS.endOfQuarter(date), isoCorrection);
      case 'year':
        return FNS.subMinutes(FNS.endOfYear(date), isoCorrection);
    }
  }

  static diff({
    startDate,
    endDate,
    unit,
    abs = true,
  }: {
    startDate: Date;
    endDate: Date;
    unit: UnitOfTime;
    abs?: boolean;
  }): number {
    let diff = 0;
    switch (unit) {
      case 'second':
        diff = FNS.differenceInSeconds(endDate, startDate);
        break;
      case 'minute':
        diff = FNS.differenceInMinutes(endDate, startDate);
        break;
      case 'hour':
        diff = FNS.differenceInHours(endDate, startDate);
        break;
      case 'day':
        diff = FNS.differenceInDays(endDate, startDate);
        break;
      case 'week':
        diff = FNS.differenceInWeeks(endDate, startDate);
        break;
      case 'month':
        diff = FNS.differenceInMonths(endDate, startDate);
        break;
      case 'quarter':
        diff = FNS.differenceInQuarters(endDate, startDate);
        break;
      case 'year':
        diff = FNS.differenceInYears(endDate, startDate);
        break;
    }
    return abs ? Math.abs(diff) : diff;
  }

  static isToday(date: Date): boolean {
    return FNS.isToday(date);
  }
  static isPast(date: Date): boolean {
    return FNS.isPast(date);
  }
  static isFuture(date: Date): boolean {
    return FNS.isFuture(date);
  }

  static sort(a: Date, b: Date): number {
    return a.getTime() - b.getTime();
  }

  static isValid(date: Date): boolean {
    return FNS.isValid(date);
  }

  static workingDaysBetween(from: Date, to: Date, workingWeekDays: string[]): number {
    const workingDays = workingWeekDays
      .map((day) => day.toLowerCase())
      .filter(isUnique)
      .filter((d) => WeekDaysNames.en.includes(d));

    const calendarDifference = FNS.differenceInCalendarDays(to, from);
    const sign = calendarDifference < 0 ? -1 : 1;
    const weeks = sign < 0 ? Math.ceil(calendarDifference / 7) : Math.floor(calendarDifference / 7);
    let result = weeks * workingDays.length;
    let dateFrom = FNS.add(from, { weeks });
    const nonWorkingWeekDays = WeekDaysNames.en
      .filter((day) => !workingDays.includes(day))
      .map((day) => WeekDaysNames.en.indexOf(day));
    while (!FNS.isSameDay(to, dateFrom)) {
      result += nonWorkingWeekDays.includes(FNS.getDay(dateFrom)) ? 0 : sign;
      dateFrom = FNS.add(dateFrom, { days: sign });
    }
    return result;
  }

  /**
   * Get time offset from UTC string
   * @param utcStringChunk in "UTC+0200" format
   * @returns time offset in hours
   */
  static extractOffsetFromUTCString(utcStringChunk: string): number | null {
    const match = utcStringChunk.match(/UTC([+-])(\d{2})(\d{2})/);

    if (!match) {
      return null;
    }

    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);
    const totalOffsetInHours = sign * (hours + minutes / 60);

    return totalOffsetInHours;
  }
}
