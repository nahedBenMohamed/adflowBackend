import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { CreateGoogleCalendarDto, GoogleCalendarDto, UpdateGoogleCalendarDto } from '../dto';
import { CalendarType } from '../enums';

import { GoogleCalendarLinked } from './google-calendar-linked.entity';

@Entity()
export class GoogleCalendar {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  createdBy: number;

  @Column()
  createdAt: Date;

  @Column()
  calendarAccountId: number;

  @Column()
  externalId: string;

  @Column()
  title: string;

  @Column()
  readonly: boolean;

  @Column()
  type: CalendarType;

  @Column()
  objectId: number;

  @Column()
  responsibleId: number;

  @Column({ nullable: true })
  syncToken: string | null;

  @Column({ nullable: true })
  channelId: string | null;

  @Column({ nullable: true })
  channelResourceId: string | null;

  @Column({ nullable: true })
  channelExpiration: Date | null;

  @Column({ default: false })
  processAll: boolean;

  constructor(
    data?: Pick<
      GoogleCalendar,
      | 'accountId'
      | 'createdBy'
      | 'calendarAccountId'
      | 'externalId'
      | 'title'
      | 'readonly'
      | 'type'
      | 'objectId'
      | 'responsibleId'
      | 'processAll'
    > & { createdAt?: Date },
  ) {
    this.accountId = data?.accountId;
    this.createdBy = data?.createdBy;
    this.createdAt = data?.createdAt ?? DateUtil.now();
    this.calendarAccountId = data?.calendarAccountId ?? data?.accountId;
    this.externalId = data?.externalId;
    this.title = data?.title;
    this.readonly = data?.readonly;
    this.type = data?.type;
    this.objectId = data?.objectId;
    this.responsibleId = data?.responsibleId;
    this.processAll = data?.processAll ?? false;
  }

  private _linked?: GoogleCalendarLinked[] | null;
  get linked(): GoogleCalendarLinked[] | null {
    return this._linked;
  }
  set linked(value: GoogleCalendarLinked[] | null) {
    this._linked = value;
  }

  static fromDto({
    accountId,
    createdBy,
    calendarAccountId,
    dto,
  }: {
    accountId: number;
    createdBy: number;
    calendarAccountId: number;
    dto: CreateGoogleCalendarDto;
  }): GoogleCalendar {
    return new GoogleCalendar({
      accountId: accountId,
      createdBy: createdBy,
      calendarAccountId: calendarAccountId,
      externalId: dto.externalId,
      title: dto.title,
      readonly: dto.readonly,
      type: dto.type,
      objectId: dto.objectId,
      responsibleId: dto.responsibleId,
      processAll: dto.processAll,
    });
  }

  update(dto: UpdateGoogleCalendarDto): GoogleCalendar {
    this.title = dto.title ?? this.title;
    this.type = dto.type ?? this.type;
    this.objectId = dto.objectId ?? this.objectId;
    this.responsibleId = dto.responsibleId ?? dto.responsibleId;
    this.processAll = dto.processAll ?? this.processAll;

    return this;
  }

  updateChannel(data: Pick<GoogleCalendar, 'channelId' | 'channelResourceId' | 'channelExpiration'>): GoogleCalendar {
    this.channelId = data.channelId;
    this.channelResourceId = data.channelResourceId;
    this.channelExpiration = data.channelExpiration;

    return this;
  }

  updateSyncToken(syncToken: string): GoogleCalendar {
    this.syncToken = syncToken;

    return this;
  }

  toDto(): GoogleCalendarDto {
    return {
      id: this.id,
      createdBy: this.createdBy,
      createdAt: this.createdAt.toISOString(),
      externalId: this.externalId,
      title: this.title,
      readonly: this.readonly,
      type: this.type,
      objectId: this.objectId,
      responsibleId: this.responsibleId,
      processAll: this.processAll,
      linked: this.linked?.map((item) => item.toDto()),
    };
  }
}
