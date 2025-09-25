import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { UserCalendarDto } from '../dto';
import { UserCalendarInterval } from './user-calendar-interval.entity';

@Entity()
export class UserCalendar {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  timeBufferBefore: number | null;

  @Column({ nullable: true })
  timeBufferAfter: number | null;

  @Column({ nullable: true })
  appointmentLimit: number | null;

  constructor(
    accountId: number,
    userId: number,
    timeBufferBefore: number | null,
    timeBufferAfter: number | null,
    appointmentLimit: number | null,
  ) {
    this.accountId = accountId;
    this.userId = userId;
    this.timeBufferBefore = timeBufferBefore;
    this.timeBufferAfter = timeBufferAfter;
    this.appointmentLimit = appointmentLimit;
  }

  private _intervals: UserCalendarInterval[] | null;
  get intervals(): UserCalendarInterval[] | null {
    return this._intervals;
  }
  set intervals(value: UserCalendarInterval[] | null) {
    this._intervals = value;
  }

  static fromDto({
    accountId,
    userId,
    dto,
  }: {
    accountId: number;
    userId: number;
    dto: UserCalendarDto;
  }): UserCalendar {
    return new UserCalendar(accountId, userId, dto.timeBufferBefore, dto.timeBufferAfter, dto.appointmentLimit);
  }

  update(dto: UserCalendarDto): UserCalendar {
    this.timeBufferBefore = dto.timeBufferBefore !== undefined ? dto.timeBufferBefore : this.timeBufferBefore;
    this.timeBufferAfter = dto.timeBufferAfter !== undefined ? dto.timeBufferAfter : this.timeBufferAfter;
    this.appointmentLimit = dto.appointmentLimit !== undefined ? dto.appointmentLimit : this.appointmentLimit;

    return this;
  }

  toDto(): UserCalendarDto {
    return {
      timeBufferBefore: this.timeBufferBefore,
      timeBufferAfter: this.timeBufferAfter,
      appointmentLimit: this.appointmentLimit,
      intervals: this._intervals?.map((interval) => interval.toDto()),
    };
  }
}
