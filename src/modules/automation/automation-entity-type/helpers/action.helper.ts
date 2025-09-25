import { DateUtil } from '@/common';
import { DeadlineType } from '../enums';

export class ActionHelper {
  public static getEndDate({
    startDate,
    deadlineType,
    deadlineTime,
  }: {
    startDate?: Date;
    deadlineType: DeadlineType;
    deadlineTime: number | null;
  }): Date {
    const from = startDate ?? DateUtil.now();
    switch (deadlineType) {
      case DeadlineType.Immediately:
        return from;
      case DeadlineType.EndOfTheDay:
        return DateUtil.endOf(from, 'day');
      case DeadlineType.InOneDay:
        return DateUtil.add(from, { days: 1 });
      case DeadlineType.InThreeDays:
        return DateUtil.add(from, { days: 3 });
      case DeadlineType.InAWeek:
        return DateUtil.endOf(from, 'week');
      case DeadlineType.Custom:
        return DateUtil.add(from, { seconds: deadlineTime });
    }
  }
}
