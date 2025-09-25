import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ForbiddenError } from '@/common';

import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { ProductsSectionService } from '@/modules/inventory/products-section/services/products-section.service';

import { ScheduleEvent, SchedulerEventType, ScheduleUpdatedEvent } from '../../common';

import { SchedulePerformerService, SchedulePerformer, SchedulePerformerType } from '../../schedule-performer';

import { CreateScheduleDto, UpdateScheduleDto } from '../dto';
import { Schedule } from '../entities';
import { ScheduleTimeIntervalService } from './schedule-time-interval.service';

interface FindFilter {
  accountId: number;
  scheduleId?: number;
  entityTypeId?: number;
}

@Injectable()
export class ScheduleService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Schedule)
    private readonly repository: Repository<Schedule>,
    private readonly authService: AuthorizationService,
    @Inject(forwardRef(() => ProductsSectionService))
    private readonly productsSectionService: ProductsSectionService,
    @Inject(forwardRef(() => SchedulePerformerService))
    private readonly performerService: SchedulePerformerService,
    private readonly intervalService: ScheduleTimeIntervalService,
  ) {}

  async create({
    accountId,
    userId,
    dto,
  }: {
    accountId: number;
    userId: number;
    dto: CreateScheduleDto;
  }): Promise<Schedule> {
    const schedule = await this.repository.save(Schedule.fromDto({ accountId, dto }));

    if (dto.performers) {
      schedule.performers = await this.performerService.createMany({
        accountId,
        scheduleId: schedule.id,
        dtos: dto.performers,
      });
    }
    if (dto.intervals) {
      schedule.intervals = await this.intervalService.createMany({
        accountId,
        scheduleId: schedule.id,
        dtos: dto.intervals,
      });
    }

    if (dto.productsSectionId && dto.entityTypeId) {
      await this.productsSectionService.ensureLinked(accountId, dto.productsSectionId, dto.entityTypeId);
    }

    this.eventEmitter.emit(
      SchedulerEventType.ScheduleCreated,
      new ScheduleEvent({ accountId, userId, scheduleId: schedule.id }),
    );

    return schedule;
  }

  async findOne({
    user,
    filter,
    checkPerformers,
  }: {
    user?: User | null;
    filter: FindFilter;
    checkPerformers?: boolean;
  }): Promise<Schedule | null> {
    const schedule = await this.createFindQb(filter).getOne();
    if (!schedule) return null;

    schedule.intervals = await this.intervalService.findMany({ accountId: filter.accountId, scheduleId: schedule.id });
    return user && checkPerformers ? this.filterPerformers({ user, schedule, throwError: true }) : schedule;
  }

  async findMany({
    user,
    filter,
    checkPerformers,
  }: {
    user?: User | null;
    filter: FindFilter;
    checkPerformers?: boolean;
  }): Promise<Schedule[]> {
    const schedules = await this.createFindQb(filter).orderBy('schedule.created_at', 'DESC').getMany();
    if (!schedules.length) return [];

    await Promise.all(
      schedules.map(async (schedule) => {
        schedule.intervals = await this.intervalService.findMany({
          accountId: filter.accountId,
          scheduleId: schedule.id,
        });
      }),
    );

    return user && checkPerformers
      ? (await Promise.all(schedules.map((schedule) => this.filterPerformers({ user, schedule })))).filter(Boolean)
      : schedules;
  }

  async update({
    accountId,
    userId,
    scheduleId,
    dto,
  }: {
    accountId: number;
    userId: number;
    scheduleId: number;
    dto: UpdateScheduleDto;
  }): Promise<Schedule> {
    const schedule = await this.findOne({ filter: { accountId, scheduleId } });

    const typeChanged = dto.type && dto.type !== schedule.type;
    const timePeriodChanged = dto.timePeriod && dto.timePeriod !== schedule.timePeriod;

    await this.repository.save(schedule.update(dto));

    if (dto.performers) {
      schedule.performers = await this.performerService.processMany({
        accountId,
        scheduleId: schedule.id,
        current: schedule.performers,
        dtos: dto.performers,
      });
    }

    if (dto.intervals) {
      schedule.intervals = await this.intervalService.updateMany({
        accountId,
        scheduleId: schedule.id,
        dtos: dto.intervals,
      });
    }

    if (dto.productsSectionId && dto.entityTypeId) {
      await this.productsSectionService.ensureLinked(accountId, dto.productsSectionId, dto.entityTypeId);
    }

    this.eventEmitter.emit(
      SchedulerEventType.ScheduleUpdated,
      new ScheduleUpdatedEvent({ accountId, userId, scheduleId: schedule.id, typeChanged, timePeriodChanged }),
    );

    return schedule;
  }

  async delete({
    accountId,
    userId,
    scheduleId,
  }: {
    accountId: number;
    userId: number;
    scheduleId: number;
  }): Promise<void> {
    await this.repository.delete({ accountId, id: scheduleId });

    this.eventEmitter.emit(SchedulerEventType.ScheduleDeleted, new ScheduleEvent({ accountId, userId, scheduleId }));
  }

  async getLinkedSchedulerIds(
    accountId: number,
    filter: { productsSectionId?: number; entityTypeId?: number },
  ): Promise<number[]> {
    const qb = this.repository
      .createQueryBuilder('schedule')
      .select('schedule.id', 'id')
      .where('schedule.accountId = :accountId', { accountId });

    if (filter.productsSectionId) {
      qb.andWhere('schedule.products_section_id = :productsSectionId', { productsSectionId: filter.productsSectionId });
    }
    if (filter.entityTypeId) {
      qb.andWhere('schedule.entity_type_id = :entityTypeId', { entityTypeId: filter.entityTypeId });
    }

    return (await qb.getRawMany()).map((s) => s.id);
  }

  async linkProductsSection(accountId: number, scheduleIds: number[] | null, productsSectionId: number): Promise<void> {
    await this.repository.update({ accountId, productsSectionId }, { productsSectionId: null });
    if (scheduleIds?.length > 0) {
      await this.repository.update({ accountId, id: In(scheduleIds) }, { productsSectionId });
    }
  }

  async linkEntityType(accountId: number, scheduleIds: number[] | null, entityTypeId: number): Promise<void> {
    await this.repository.update({ accountId, entityTypeId }, { entityTypeId: null });
    if (scheduleIds?.length > 0) {
      await this.repository.update({ accountId, id: In(scheduleIds) }, { entityTypeId });
    }
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('schedule')
      .where('schedule.accountId = :accountId', { accountId: filter.accountId })
      .leftJoinAndMapMany('schedule.performers', SchedulePerformer, 'performer', 'schedule.id = performer.schedule_id');

    if (filter.scheduleId) {
      qb.andWhere('schedule.id = :id', { id: filter.scheduleId });
    }
    if (filter.entityTypeId) {
      qb.andWhere('schedule.entity_type_id = :entityTypeId', { entityTypeId: filter.entityTypeId });
    }

    return qb;
  }

  private async filterPerformers({
    user,
    schedule,
    throwError = false,
  }: {
    user: User;
    schedule: Schedule;
    throwError?: boolean;
  }): Promise<Schedule | null> {
    const { allow, userIds, departmentIds } = await this.authService.getPermissions({
      action: 'view',
      user,
      authorizable: Schedule.getAuthorizable(schedule.id),
    });

    if (!allow) {
      if (throwError) {
        throw new ForbiddenError();
      } else {
        return null;
      }
    }

    if (userIds) {
      schedule.performers = schedule.performers.filter(
        (p) =>
          (p.type === SchedulePerformerType.User && userIds.includes(p.userId)) ||
          (p.type === SchedulePerformerType.Department && departmentIds.includes(p.departmentId)),
      );
    }

    return schedule;
  }
}
