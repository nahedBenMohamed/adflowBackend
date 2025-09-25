import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BadRequestError, NotFoundError } from '@/common';

import { SchedulePerformerDeletedEvent, SchedulePerformerEvent, SchedulerEventType } from '../common';
import { ScheduleAppointmentService } from '../schedule-appointment/schedule-appointment.service';

import { CreateSchedulePerformerDto, UpdateSchedulePerformerDto } from './dtos';
import { SchedulePerformer } from './entities';

interface FindFilter {
  accountId: number;
  performerId?: number;
  userId?: number;
  departmentId?: number;
  scheduleId?: number;
}

@Injectable()
export class SchedulePerformerService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(SchedulePerformer)
    private readonly repository: Repository<SchedulePerformer>,
    @Inject(forwardRef(() => ScheduleAppointmentService))
    private readonly appointmentService: ScheduleAppointmentService,
  ) {}

  public async create({
    accountId,
    scheduleId,
    dto,
  }: {
    accountId: number;
    scheduleId: number;
    dto: CreateSchedulePerformerDto;
  }): Promise<SchedulePerformer> {
    const performer = await this.repository.save(SchedulePerformer.fromDto(accountId, scheduleId, dto));

    this.eventEmitter.emit(
      SchedulerEventType.SchedulePerformerCreated,
      new SchedulePerformerEvent({ source: SchedulePerformer.name, accountId, scheduleId, performerId: performer.id }),
    );

    return performer;
  }
  public async createMany({
    accountId,
    scheduleId,
    dtos,
  }: {
    accountId: number;
    scheduleId: number;
    dtos: CreateSchedulePerformerDto[];
  }): Promise<SchedulePerformer[]> {
    return Promise.all(dtos.map((dto) => this.create({ accountId, scheduleId, dto })));
  }

  public async findOne(filter: FindFilter): Promise<SchedulePerformer | null> {
    return this.createFindQb(filter).getOne();
  }
  public async findMany(filter: FindFilter): Promise<SchedulePerformer[]> {
    return await this.createFindQb(filter).orderBy('sp.id').getMany();
  }

  public async processMany({
    accountId,
    scheduleId,
    current,
    dtos,
  }: {
    accountId: number;
    scheduleId: number;
    current: SchedulePerformer[];
    dtos: CreateSchedulePerformerDto[];
  }): Promise<SchedulePerformer[]> {
    const created = dtos.filter((dto) => !current.some((p) => p.equals(dto)));
    const deleted = current.filter((p) => !dtos.some((dto) => p.equals(dto)));

    if (created.length) {
      current.push(...(await this.createMany({ accountId, scheduleId, dtos: created })));
    }

    if (deleted.length) {
      await Promise.all(deleted.map((p) => this.delete({ accountId, scheduleId, performerId: p.id })));
    }

    return current.filter((p) => !deleted.some((r) => p.id === r.id));
  }

  public async update({
    accountId,
    scheduleId,
    performerId,
    dto,
  }: {
    accountId: number;
    scheduleId: number;
    performerId: number;
    dto: UpdateSchedulePerformerDto;
  }): Promise<SchedulePerformer> {
    const performer = await this.findOne({ accountId, scheduleId, performerId });
    if (!performer) {
      throw NotFoundError.withId(SchedulePerformer, performerId);
    }

    await this.repository.save(performer.update(dto));

    this.eventEmitter.emit(
      SchedulerEventType.SchedulePerformerUpdated,
      new SchedulePerformerEvent({ source: SchedulePerformer.name, accountId, scheduleId, performerId }),
    );

    return performer;
  }

  public async delete({
    accountId,
    scheduleId,
    performerId,
    newPerformerId,
  }: {
    accountId: number;
    scheduleId: number;
    performerId: number;
    newPerformerId?: number;
  }) {
    if (newPerformerId) {
      await this.appointmentService.changePerformer(accountId, performerId, newPerformerId);
    }
    await this.repository.delete({ accountId, scheduleId, id: performerId });

    this.eventEmitter.emit(
      SchedulerEventType.SchedulePerformerDeleted,
      new SchedulePerformerDeletedEvent({
        source: SchedulePerformer.name,
        accountId,
        scheduleId,
        performerId,
        newPerformerId,
      }),
    );
  }

  public async deletePerformer({
    accountId,
    userId,
    departmentId,
    newId,
  }: {
    accountId: number;
    userId?: number | null;
    departmentId?: number | null;
    newId?: number | null;
  }) {
    if ((!userId && !departmentId) || (userId && departmentId)) {
      throw new BadRequestError('userId or departmentId must be specified');
    }
    const performers = await this.findMany({ accountId, userId, departmentId });
    if (performers.length) {
      if (newId) {
        await Promise.all(
          performers.map(async (performer) => {
            const coPerformers = await this.findMany({ accountId, scheduleId: performer.scheduleId });
            const newPerformer = coPerformers.find(
              (p) => (userId && p.userId === newId) || (departmentId && p.departmentId === newId),
            );
            if (newPerformer) {
              await this.delete({
                accountId,
                scheduleId: performer.scheduleId,
                performerId: performer.id,
                newPerformerId: newPerformer.id,
              });
            } else {
              await this.update({
                accountId,
                scheduleId: performer.scheduleId,
                performerId: performer.id,
                dto: { userId: userId ? newId : undefined, departmentId: departmentId ? newId : undefined },
              });
            }
          }),
        );
      } else {
        await Promise.all(
          performers.map((p) => this.delete({ accountId, scheduleId: p.scheduleId, performerId: p.id })),
        );
      }
    }
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('sp')
      .where('sp.account_id = :accountId', { accountId: filter.accountId });
    if (filter?.performerId) {
      qb.andWhere('sp.id = :id', { id: filter.performerId });
    }
    if (filter?.userId) {
      qb.andWhere('sp.user_id = :userId', { userId: filter.userId });
    }
    if (filter?.departmentId) {
      qb.andWhere('sp.department_id = :departmentId', { departmentId: filter.departmentId });
    }
    if (filter?.scheduleId) {
      qb.andWhere('sp.schedule_id = :scheduleId', { scheduleId: filter.scheduleId });
    }
    return qb;
  }
}
