import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ScheduleTimeIntervalDto } from '../dto';
import { ScheduleTimeInterval } from '../entities';

interface FindFilter {
  accountId: number;
  scheduleId: number;
}

@Injectable()
export class ScheduleTimeIntervalService {
  constructor(
    @InjectRepository(ScheduleTimeInterval)
    private readonly repository: Repository<ScheduleTimeInterval>,
  ) {}

  async create({
    accountId,
    scheduleId,
    dto,
  }: {
    accountId: number;
    scheduleId: number;
    dto: ScheduleTimeIntervalDto;
  }) {
    return this.repository.save(ScheduleTimeInterval.fromDto({ accountId, scheduleId, dto }));
  }
  async createMany({
    accountId,
    scheduleId,
    dtos,
  }: {
    accountId: number;
    scheduleId: number;
    dtos: ScheduleTimeIntervalDto[];
  }) {
    return Promise.all(dtos.map((dto) => this.create({ accountId, scheduleId, dto })));
  }

  async findMany(filter: FindFilter): Promise<ScheduleTimeInterval[]> {
    return this.createQb(filter).getMany();
  }

  async updateMany({
    accountId,
    scheduleId,
    dtos,
  }: {
    accountId: number;
    scheduleId: number;
    dtos: ScheduleTimeIntervalDto[];
  }) {
    await this.deleteMany({ accountId, scheduleId });
    return this.createMany({ accountId, scheduleId, dtos });
  }

  async deleteMany({ accountId, scheduleId }: FindFilter) {
    await this.repository.delete({ accountId, scheduleId });
  }

  private createQb({ accountId, scheduleId }: FindFilter) {
    return this.repository
      .createQueryBuilder('interval')
      .where('interval.account_id = :accountId', { accountId })
      .andWhere('interval.schedule_id = :scheduleId', { scheduleId });
  }
}
