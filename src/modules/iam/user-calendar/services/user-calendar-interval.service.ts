import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserCalendarIntervalDto } from '../dto';
import { UserCalendarInterval } from '../entities';

interface FindFilter {
  accountId: number;
  calendarId: number;
}

@Injectable()
export class UserCalendarIntervalService {
  constructor(
    @InjectRepository(UserCalendarInterval)
    private readonly repository: Repository<UserCalendarInterval>,
  ) {}

  async create({
    accountId,
    calendarId,
    dto,
  }: {
    accountId: number;
    calendarId: number;
    dto: UserCalendarIntervalDto;
  }) {
    return this.repository.save(UserCalendarInterval.fromDto({ accountId, calendarId, dto }));
  }
  async createMany({
    accountId,
    calendarId,
    dtos,
  }: {
    accountId: number;
    calendarId: number;
    dtos: UserCalendarIntervalDto[];
  }) {
    return Promise.all(dtos.map((dto) => this.create({ accountId, calendarId, dto })));
  }

  async findMany(filter: FindFilter): Promise<UserCalendarInterval[]> {
    return this.createQb(filter).getMany();
  }

  async updateMany({
    accountId,
    calendarId,
    dtos,
  }: {
    accountId: number;
    calendarId: number;
    dtos: UserCalendarIntervalDto[];
  }) {
    await this.deleteMany({ accountId, calendarId });
    return this.createMany({ accountId, calendarId, dtos });
  }

  async deleteMany({ accountId, calendarId }: FindFilter) {
    await this.repository.delete({ accountId, calendarId });
  }

  private createQb({ accountId, calendarId }: FindFilter) {
    return this.repository
      .createQueryBuilder('interval')
      .where('interval.account_id = :accountId', { accountId })
      .andWhere('interval.calendar_id = :calendarId', { calendarId });
  }
}
