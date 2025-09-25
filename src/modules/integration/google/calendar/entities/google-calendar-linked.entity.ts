import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { GoogleCalendarLinkedDto } from '../dto';
import { CalendarType } from '../enums';

@Entity()
export class GoogleCalendarLinked {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  calendarId: number;

  @Column()
  type: CalendarType;

  @Column()
  objectId: number;

  constructor(data?: Pick<GoogleCalendarLinked, 'accountId' | 'calendarId' | 'type' | 'objectId'>) {
    this.accountId = data?.accountId;
    this.calendarId = data?.calendarId;
    this.type = data?.type;
    this.objectId = data?.objectId;
  }

  static fromDto({
    accountId,
    calendarId,
    dto,
  }: {
    accountId: number;
    calendarId: number;
    dto: GoogleCalendarLinkedDto;
  }): GoogleCalendarLinked {
    return new GoogleCalendarLinked({
      accountId: accountId,
      calendarId: calendarId,
      type: dto.type,
      objectId: dto.objectId,
    });
  }

  toDto(): GoogleCalendarLinkedDto {
    return { type: this.type, objectId: this.objectId };
  }
}
