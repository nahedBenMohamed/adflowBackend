import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserCalendarIntervalDto } from '../dto';

@Entity()
export class UserCalendarInterval {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  calendarId: number;

  @Column()
  dayOfWeek: string;

  @Column({ type: 'time' })
  timeFrom: string;

  @Column({ type: 'time' })
  timeTo: string;

  constructor(accountId: number, calendarId: number, dayOfWeek: string, timeFrom: string, timeTo: string) {
    this.accountId = accountId;
    this.calendarId = calendarId;
    this.dayOfWeek = dayOfWeek;
    this.timeFrom = timeFrom;
    this.timeTo = timeTo;
  }

  static fromDto({
    accountId,
    calendarId,
    dto,
  }: {
    accountId: number;
    calendarId: number;
    dto: UserCalendarIntervalDto;
  }): UserCalendarInterval {
    return new UserCalendarInterval(accountId, calendarId, dto.dayOfWeek, dto.timeFrom, dto.timeTo);
  }

  toDto(): UserCalendarIntervalDto {
    return {
      dayOfWeek: this.dayOfWeek,
      timeFrom: this.timeFrom.substring(0, 5),
      timeTo: this.timeTo.substring(0, 5),
    };
  }
}
