import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ScheduleTimeIntervalDto } from '../dto';

@Entity()
export class ScheduleTimeInterval {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  scheduleId: number;

  @Column()
  dayOfWeek: string;

  @Column({ type: 'time' })
  timeFrom: string;

  @Column({ type: 'time' })
  timeTo: string;

  constructor(accountId: number, scheduleId: number, dayOfWeek: string, timeFrom: string, timeTo: string) {
    this.accountId = accountId;
    this.scheduleId = scheduleId;
    this.dayOfWeek = dayOfWeek;
    this.timeFrom = timeFrom;
    this.timeTo = timeTo;
  }

  static fromDto({
    accountId,
    scheduleId,
    dto,
  }: {
    accountId: number;
    scheduleId: number;
    dto: ScheduleTimeIntervalDto;
  }): ScheduleTimeInterval {
    return new ScheduleTimeInterval(accountId, scheduleId, dto.dayOfWeek, dto.timeFrom, dto.timeTo);
  }

  toDto(): ScheduleTimeIntervalDto {
    return {
      dayOfWeek: this.dayOfWeek,
      timeFrom: this.timeFrom.substring(0, 5),
      timeTo: this.timeTo.substring(0, 5),
    };
  }
}
