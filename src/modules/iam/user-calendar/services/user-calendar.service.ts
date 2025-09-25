import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserCalendarDto } from '../dto';
import { UserCalendar } from '../entities';
import { UserCalendarIntervalService } from './user-calendar-interval.service';

interface FindFilter {
  accountId: number;
  userId?: number;
}

@Injectable()
export class UserCalendarService {
  constructor(
    @InjectRepository(UserCalendar)
    private readonly repository: Repository<UserCalendar>,
    private readonly intervalService: UserCalendarIntervalService,
  ) {}

  async create({
    accountId,
    userId,
    dto,
  }: {
    accountId: number;
    userId: number;
    dto: UserCalendarDto;
  }): Promise<UserCalendar> {
    const calendar = await this.repository.save(UserCalendar.fromDto({ accountId, userId, dto }));
    if (dto.intervals) {
      calendar.intervals = await this.intervalService.createMany({
        accountId,
        calendarId: calendar.id,
        dtos: dto.intervals,
      });
    }
    return calendar;
  }

  async findOne(filter: FindFilter): Promise<UserCalendar | null> {
    const calendar = await this.createQb(filter).getOne();
    if (calendar) {
      calendar.intervals = await this.intervalService.findMany({
        accountId: filter.accountId,
        calendarId: calendar.id,
      });
    }
    return calendar;
  }
  async findMany(filter: FindFilter): Promise<UserCalendar[]> {
    const calendars = await this.createQb(filter).getMany();
    if (calendars.length) {
      await Promise.all(
        calendars.map(async (calendar) => {
          calendar.intervals = await this.intervalService.findMany({
            accountId: filter.accountId,
            calendarId: calendar.id,
          });
        }),
      );
    }
    return calendars;
  }

  async update({
    accountId,
    userId,
    dto,
  }: {
    accountId: number;
    userId: number;
    dto: UserCalendarDto;
  }): Promise<UserCalendar> {
    const calendar = await this.findOne({ accountId, userId });
    if (!calendar) {
      return this.create({ accountId, userId, dto });
    }
    await this.repository.save(calendar.update(dto));
    if (dto.intervals) {
      calendar.intervals = await this.intervalService.updateMany({
        accountId,
        calendarId: calendar.id,
        dtos: dto.intervals,
      });
    }
    return calendar;
  }

  async delete({ accountId, userId }: { accountId: number; userId: number }) {
    await this.repository.delete({ accountId, userId });
  }

  private createQb(filter: FindFilter) {
    const qb = this.repository.createQueryBuilder('user_calendar');
    qb.where('user_calendar.account_id = :accountId', { accountId: filter.accountId });
    if (filter.userId) {
      qb.andWhere('user_calendar.user_id = :userId', { userId: filter.userId });
    }
    return qb;
  }
}
