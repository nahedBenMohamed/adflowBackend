import { DatePeriodDto, DatePeriodFilter } from '../../dto';
import { DatePeriodFilterType } from '../../enums';
import { DateUtil } from '../../utils';

export class DatePeriod {
  public from?: Date | null;
  public to?: Date | null;

  constructor(from: Date | null | undefined, to: Date | null | undefined) {
    this.from = from;
    this.to = to;
  }

  public static fromDto(dto: DatePeriodDto, isISO = true): DatePeriod {
    return new DatePeriod(
      dto.startDate ? (isISO ? DateUtil.fromISOString(dto.startDate) : new Date(dto.startDate)) : undefined,
      dto.endDate ? (isISO ? DateUtil.fromISOString(dto.endDate) : new Date(dto.endDate)) : undefined,
    );
  }

  public static fromFilter(filter: DatePeriodFilter): DatePeriod {
    const now = DateUtil.now();
    let from: Date | null = null;
    let to: Date | null = null;
    switch (filter.type) {
      case DatePeriodFilterType.Today:
        from = DateUtil.startOf(now, 'day');
        to = DateUtil.endOf(now, 'day');
        break;
      case DatePeriodFilterType.Yesterday:
        from = DateUtil.sub(DateUtil.startOf(now, 'day'), { days: 1 });
        to = DateUtil.sub(DateUtil.endOf(now, 'day'), { days: 1 });
        break;
      case DatePeriodFilterType.CurrentWeek:
        from = DateUtil.startOf(now, 'week');
        to = DateUtil.endOf(now, 'week');
        break;
      case DatePeriodFilterType.LastWeek:
        from = DateUtil.sub(DateUtil.startOf(now, 'week'), { weeks: 1 });
        to = DateUtil.sub(DateUtil.endOf(now, 'week'), { weeks: 1 });
        break;
      case DatePeriodFilterType.CurrentMonth:
        from = DateUtil.startOf(now, 'month');
        to = DateUtil.endOf(now, 'month');
        break;
      case DatePeriodFilterType.LastMonth:
        from = DateUtil.sub(DateUtil.startOf(now, 'month'), { months: 1 });
        to = DateUtil.sub(DateUtil.endOf(now, 'month'), { months: 1 });
        break;
      case DatePeriodFilterType.CurrentQuarter:
        from = DateUtil.startOf(now, 'quarter');
        to = DateUtil.endOf(now, 'quarter');
        break;
      case DatePeriodFilterType.LastQuarter:
        from = DateUtil.sub(DateUtil.startOf(now, 'quarter'), { months: 3 });
        to = DateUtil.sub(DateUtil.endOf(now, 'quarter'), { months: 3 });
        break;
      case DatePeriodFilterType.Period:
        from = filter.from ? DateUtil.fromISOString(filter.from) : null;
        to = filter.to ? DateUtil.fromISOString(filter.to) : null;
        break;
    }
    return new DatePeriod(from, to);
  }

  public toDto(): DatePeriodDto {
    return { startDate: this.from?.toISOString(), endDate: this.to?.toISOString() };
  }
}
