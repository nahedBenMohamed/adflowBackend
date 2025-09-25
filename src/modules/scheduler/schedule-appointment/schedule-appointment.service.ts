import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

import { DatePeriod, DateUtil, ForbiddenError, NotFoundError, PagingQuery, ServiceEvent } from '@/common';

import { EntityInfoService } from '@/modules/entity/entity-info/entity-info.service';
import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { UserService } from '@/modules/iam/user/user.service';
import { UserCalendarService } from '@/modules/iam/user-calendar/services/user-calendar.service';
import { WorkingTimeService } from '@/modules/iam/working-time/working-time.service';
import { OrderService } from '@/modules/inventory/order/services/order.service';
import { EntityListItem, EntityListMeta } from '@/CRM/Service/Entity/Dto/List';
import { EntityBoardService } from '@/CRM/Service/Entity/EntityBoardService';

import {
  ScheduleAppointmentStatus,
  SchedulerAppointmentCreatedEvent,
  SchedulerAppointmentEvent,
  SchedulerAppointmentExtUpsertEvent,
  SchedulerAppointmentUpdatedEvent,
  SchedulerEventType,
} from '../common';
import { ScheduleService } from '../schedule/services/schedule.service';
import { Schedule } from '../schedule/entities';
import { SchedulePerformer } from '../schedule-performer/entities';

import { CreateScheduleAppointmentDto, ScheduleAppointmentFilterDto, UpdateScheduleAppointmentDto } from './dto';
import { ScheduleAppointment } from './entities';
import { AppointmentDatesConflictError, AppointmentDayLimitError, AppointmentIntersectionError } from './errors';
import { ExpandableField, ScheduleAppointmentResult, ScheduleAppointmentStatistic, Spot } from './types';

interface FindFilter {
  accountId: number;
  appointmentId?: number | number[];
  scheduleId?: number;
  entityId?: number;
  performerId?: number;
  showCanceled?: boolean;
  title?: string;
  status?: ScheduleAppointmentStatus | ScheduleAppointmentStatus[];
  from?: Date;
  to?: Date;
  isNewbie?: boolean;
  isNotScheduled?: boolean;
  isNotTookPlace?: boolean;
  externalId?: string;
}

interface DeleteFilter {
  appointmentId?: number | number[];
  scheduleId?: number;
}

interface FindOptions {
  joinPerformer?: boolean;
  isSchedule?: boolean;
  expand?: ExpandableField[];
}

interface StatusCount {
  status: ScheduleAppointmentStatus;
  count: number;
}
interface Count {
  count: number;
}

interface WorkingTime {
  dayOfWeek: string;
  timeFrom: string;
  timeTo: string;
}
interface SpotScheduleSettings {
  appointmentLimit?: number;
  timeBufferBefore?: number;
  timeBufferAfter?: number;
  timezone: string;
  intervals: WorkingTime[];
}

@Injectable()
export class ScheduleAppointmentService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(ScheduleAppointment)
    private readonly repository: Repository<ScheduleAppointment>,
    private readonly authService: AuthorizationService,
    private readonly userService: UserService,
    private readonly orderService: OrderService,
    private readonly scheduleService: ScheduleService,
    private readonly entityInfoService: EntityInfoService,
    private readonly entityBoardService: EntityBoardService,
    private readonly userCalendarService: UserCalendarService,
    private readonly workingTimeService: WorkingTimeService,
  ) {}

  async create({
    accountId,
    user,
    dto,
    skipPermissionCheck,
    event,
  }: {
    accountId: number;
    user: User;
    dto: CreateScheduleAppointmentDto;
    skipPermissionCheck?: boolean;
    event?: ServiceEvent;
  }): Promise<ScheduleAppointment> {
    if (!skipPermissionCheck) {
      await this.authService.check({
        action: 'create',
        user,
        authorizable: ScheduleAppointment.getAuthorizable(dto.scheduleId),
        throwError: true,
      });
    }

    const schedule = await this.scheduleService.findOne({ filter: { accountId, scheduleId: dto.scheduleId } });
    if (!schedule?.timePeriod && !dto.endDate) {
      throw new AppointmentDatesConflictError('Schedule time period is not defined');
    }

    let appointment = ScheduleAppointment.fromDto(accountId, user.id, dto, schedule.timePeriod);
    if (appointment.endDate <= appointment.startDate) {
      throw new AppointmentDatesConflictError();
    }

    if (dto.checkIntersection && (await this.hasIntersect(appointment))) {
      throw new AppointmentIntersectionError();
    }

    if (appointment.entityId) {
      await this.checkEntityDayLimit(appointment);
    }

    appointment = await this.repository.save(appointment);

    this.eventEmitter.emit(
      SchedulerEventType.ScheduleAppointmentCreated,
      new SchedulerAppointmentCreatedEvent({
        source: ScheduleAppointment.name,
        accountId,
        ownerId: appointment.ownerId,
        scheduleId: appointment.scheduleId,
        performerId: appointment.performerId,
        appointmentId: appointment.id,
        externalId: appointment.externalId,
        title: appointment.title,
        comment: appointment.comment,
        startDate: appointment.startDate,
        endDate: appointment.endDate,
        status: appointment.status,
        entityId: appointment.entityId,
        prevEvent: event,
      }),
    );

    appointment.userRights = await this.authService.getUserRights({ user, authorizable: appointment });

    return this.expandOne({ accountId, user, appointment, expand: ['prevAppointmentCount', 'entityInfo', 'order'] });
  }

  async getOne({
    accountId,
    user,
    appointmentId,
    options,
  }: {
    accountId: number;
    user: User;
    appointmentId: number;
    options?: FindOptions;
  }): Promise<ScheduleAppointment> {
    const appointment = await this.createFindQb({
      filter: { accountId, appointmentId },
      options: { joinPerformer: true },
    }).getOne();

    if (!appointment) {
      throw NotFoundError.withId(ScheduleAppointment, appointmentId);
    }

    appointment.userRights = await this.authService.getUserRights({ user, authorizable: appointment });
    if (!appointment.userRights.canView) {
      throw new ForbiddenError();
    }

    return options?.expand ? this.expandOne({ accountId, user, appointment, expand: options.expand }) : appointment;
  }

  async getCount({
    accountId,
    filter,
    isSchedule,
  }: {
    accountId: number;
    filter: ScheduleAppointmentFilterDto;
    isSchedule?: boolean;
  }): Promise<number> {
    const period = DatePeriod.fromDto(filter);
    return this.createFindQb({
      filter: { accountId, ...filter, from: period.from, to: period.to },
      options: { isSchedule },
    }).getCount();
  }

  async getLast({
    accountId,
    user,
    filter,
  }: {
    accountId: number;
    user: User;
    filter: ScheduleAppointmentFilterDto;
  }): Promise<ScheduleAppointment | null> {
    const period = DatePeriod.fromDto(filter);
    const appointment = await this.createFindQb({
      filter: { accountId, ...filter, from: period.from, to: DateUtil.now() },
      options: { joinPerformer: true },
    })
      .orderBy('appointment.end_date', 'DESC')
      .getOne();

    if (appointment) {
      appointment.userRights = await this.authService.getUserRights({ user, authorizable: appointment });
    }

    return appointment;
  }

  async findOne({
    filter,
    joinPerformer,
  }: {
    filter: FindFilter;
    joinPerformer?: boolean;
  }): Promise<ScheduleAppointment | null> {
    return this.createFindQb({ filter, options: { joinPerformer } }).getOne();
  }
  async findMany({
    filter,
    joinPerformer,
  }: {
    filter: FindFilter;
    joinPerformer?: boolean;
  }): Promise<ScheduleAppointment[]> {
    return this.createFindQb({ filter, options: { joinPerformer } }).getMany();
  }

  async getSchedule({
    accountId,
    user,
    filter,
    paging,
    options,
  }: {
    accountId: number;
    user: User;
    filter: ScheduleAppointmentFilterDto;
    paging: PagingQuery;
    options?: FindOptions;
  }): Promise<ScheduleAppointmentResult> {
    const period = DatePeriod.fromDto(filter);
    const [appointments, total] = await this.createFindQb({
      filter: { accountId, ...filter, from: period.from, to: period.to },
      options: { isSchedule: true, joinPerformer: true },
    })
      .offset(paging.offset)
      .limit(paging.limit)
      .orderBy('appointment.start_date', 'DESC')
      .getManyAndCount();

    const expanded: ScheduleAppointment[] = await Promise.all(
      appointments.map(async (appointment) => {
        appointment.userRights = await this.authService.getUserRights({ user, authorizable: appointment });
        return appointment.userRights.canView && options?.expand
          ? this.expandOne({ accountId, user, appointment, expand: options.expand })
          : appointment;
      }),
    );

    const result = new ScheduleAppointmentResult(
      expanded.filter((a) => a.userRights.canView),
      paging.skip + paging.take,
      total,
    );

    return result;
  }

  async getStatistic({
    accountId,
    filter,
  }: {
    accountId: number;
    filter: ScheduleAppointmentFilterDto;
  }): Promise<ScheduleAppointmentStatistic> {
    const period = DatePeriod.fromDto(filter);
    const qb = this.createFindQb({
      filter: { accountId, ...filter, from: period.from, to: period.to },
      options: { isSchedule: true },
    });

    const [rawStatuses, newbies, notScheduled, notTookPlace] = await Promise.all([
      qb
        .clone()
        .select('appointment.status', 'status')
        .addSelect('COUNT(*)::int', 'count')
        .groupBy('appointment.status')
        .getRawMany<StatusCount>(),
      qb
        .clone()
        .select('COUNT(DISTINCT appointment.entityId)::int', 'count')
        .andWhere('appointment.entityId IS NOT NULL')
        .andWhere(
          `NOT EXISTS (SELECT 1 FROM schedule_appointment ia WHERE ia.schedule_id = appointment.schedule_id AND ` +
            `ia.entity_id IS NOT NULL AND ia.entity_id = appointment.entity_id ` +
            `AND ia.status != '${ScheduleAppointmentStatus.Canceled}' AND ia.end_date < appointment.start_date)`,
        )
        .getRawOne<Count>(),
      qb
        .clone()
        .select('COUNT(DISTINCT appointment.entity_id)::int', 'count')
        .andWhere(
          `NOT EXISTS (SELECT 1 FROM schedule_appointment fa ` +
            `WHERE fa.schedule_id = appointment.schedule_id AND fa.entity_id IS NOT NULL ` +
            `AND fa.entity_id = appointment.entity_id ` +
            `AND fa.status != '${ScheduleAppointmentStatus.Canceled}' AND fa.start_date > appointment.start_date)`,
        )
        .getRawOne<Count>(),
      qb
        .clone()
        .select('COUNT(*)::int', 'count')
        .andWhere('appointment.status IN (:...notTookPlaceStatuses)', {
          notTookPlaceStatuses: [ScheduleAppointmentStatus.NotConfirmed, ScheduleAppointmentStatus.Confirmed],
        })
        .andWhere('appointment.end_date < now()')
        .getRawOne<Count>(),
    ]);

    let total = 0;
    const statuses: Record<ScheduleAppointmentStatus, number> = {
      not_confirmed: 0,
      confirmed: 0,
      completed: 0,
      canceled: 0,
    };
    for (const rawStatus of rawStatuses) {
      total += rawStatus.count;
      statuses[rawStatus.status] += rawStatus.count;
    }

    return new ScheduleAppointmentStatistic({
      total,
      newbies: newbies?.count ?? 0,
      notScheduled: notScheduled?.count ?? 0,
      notTookPlace: notTookPlace?.count ?? 0,
      statuses,
    });
  }

  async getEntityList({
    accountId,
    user,
    filter,
    paging,
  }: {
    accountId: number;
    user: User;
    filter: ScheduleAppointmentFilterDto;
    paging: PagingQuery;
  }): Promise<EntityListItem[]> {
    const period = DatePeriod.fromDto(filter);
    const entities = await this.createFindQb({
      filter: { accountId, ...filter, from: period.from, to: period.to },
      options: { isSchedule: true },
    })
      .select('DISTINCT(appointment.entity_id)', 'entityId')
      .andWhere('appointment.entity_id IS NOT NULL')
      .orderBy('appointment.entity_id')
      .offset(paging.skip)
      .limit(paging.take)
      .getRawMany<{ entityId: number }>();

    return entities.length
      ? this.entityBoardService.createListItems({ accountId, user, entityIds: entities.map((e) => e.entityId) })
      : [];
  }

  async getEntityListMeta({
    accountId,
    filter,
  }: {
    accountId: number;
    filter: ScheduleAppointmentFilterDto;
  }): Promise<EntityListMeta> {
    const period = DatePeriod.fromDto(filter);
    const { cnt } = await this.createFindQb({
      filter: { accountId, ...filter, from: period.from, to: period.to },
      options: { isSchedule: true },
    })
      .select('COUNT(DISTINCT(appointment.entity_id))', 'cnt')
      .andWhere('appointment.entity_id IS NOT NULL')
      .getRawOne<{ cnt: number }>();

    return { totalCount: cnt, hasPrice: false, totalPrice: 0 };
  }

  async getAvailableDates({
    accountId,
    scheduleId,
    performerId,
    minDate,
    maxDate,
    daysLimit,
    timezone,
  }: {
    accountId: number;
    scheduleId: number;
    performerId: number;
    minDate: Date;
    maxDate: Date;
    daysLimit: number;
    timezone: string;
  }): Promise<string[]> {
    const spots = await this.getAvailableSpots({ accountId, scheduleId, performerId, minDate, maxDate, daysLimit });

    const uniqueDates = new Set<string>();

    spots.forEach((spot) => {
      uniqueDates.add(DateUtil.format(toZonedTime(spot.from, timezone), 'yyyy-MM-dd'));
      uniqueDates.add(DateUtil.format(toZonedTime(spot.to, timezone), 'yyyy-MM-dd'));
    });

    return Array.from(uniqueDates);
  }

  async getAvailableSpots({
    accountId,
    scheduleId,
    performerId,
    minDate,
    maxDate,
    daysLimit,
  }: {
    accountId: number;
    scheduleId: number;
    performerId: number;
    minDate: Date;
    maxDate: Date;
    daysLimit: number;
  }): Promise<Spot[]> {
    const schedule = await this.scheduleService.findOne({ filter: { accountId, scheduleId } });
    if (!schedule?.timePeriod) {
      return [];
    }
    const performer = schedule?.performers.find((p) => p.id === performerId);
    if (!performer) {
      return [];
    }

    const settings = await this.getSpotScheduleSettings({ accountId, schedule, performer });

    const now = DateUtil.now();
    const limitDate = DateUtil.add(now, { days: daysLimit });
    const from = now > minDate ? now : minDate;
    const to = limitDate < maxDate ? limitDate : maxDate;
    if (from >= to) {
      return [];
    }

    const spots = this.generateSpots({ from, to, seconds: schedule.timePeriod, settings });
    if (!spots.length) {
      return [];
    }

    const appointments = await this.createFindQb({
      filter: { accountId, scheduleId: schedule.id, performerId: performer.id, from, to },
      options: { isSchedule: true },
    }).getMany();

    const occupiedSpots: Spot[] = appointments.map((a) => ({
      from: settings.timeBufferBefore ? DateUtil.sub(a.startDate, { seconds: settings.timeBufferBefore }) : a.startDate,
      to: settings.timeBufferAfter ? DateUtil.add(a.endDate, { seconds: settings.timeBufferAfter }) : a.endDate,
    }));

    return spots.filter((spot) => !occupiedSpots.some((occ) => occ.from < spot.to && occ.to > spot.from));
  }
  private async getSpotScheduleSettings({
    accountId,
    schedule,
    performer,
  }: {
    accountId: number;
    schedule: Schedule;
    performer: SchedulePerformer;
  }): Promise<SpotScheduleSettings> {
    const workingTime = performer.userId
      ? await this.workingTimeService.getForUser({ accountId, userId: performer.userId })
      : await this.workingTimeService.getForDepartment({
          accountId,
          departmentId: performer.departmentId,
        });

    const settings: SpotScheduleSettings = {
      timezone: workingTime.timeZone,
      appointmentLimit: schedule.appointmentLimit,
      timeBufferBefore: schedule.timeBufferBefore,
      timeBufferAfter: schedule.timeBufferAfter,
      intervals: undefined,
    };

    if (schedule.intervals?.length) {
      settings.intervals = schedule.intervals.map((i) => ({
        dayOfWeek: i.dayOfWeek,
        timeFrom: i.timeFrom,
        timeTo: i.timeTo,
      }));
    } else if (performer.userId) {
      const userCalendar = await this.userCalendarService.findOne({ accountId, userId: performer.userId });
      if (userCalendar) {
        settings.appointmentLimit = userCalendar.appointmentLimit;
        settings.timeBufferBefore = userCalendar.timeBufferBefore;
        settings.timeBufferAfter = userCalendar.timeBufferAfter;
        if (userCalendar.intervals?.length) {
          settings.intervals = userCalendar.intervals.map((i) => ({
            dayOfWeek: i.dayOfWeek,
            timeFrom: i.timeFrom,
            timeTo: i.timeTo,
          }));
        }
      }
    }

    if (!settings.intervals?.length) {
      settings.intervals = workingTime.workingDays?.map((d) => ({
        dayOfWeek: d,
        timeFrom: workingTime.workingTimeFrom,
        timeTo: workingTime.workingTimeTo,
      }));
    }

    return settings;
  }
  private generateSpots({
    from,
    to,
    seconds,
    settings,
  }: {
    from: Date;
    to: Date;
    seconds: number;
    settings: SpotScheduleSettings;
  }): Spot[] {
    const dates = this.getSpotDates({ from, to, timezone: settings.timezone });
    const spots: Spot[] = [];
    for (const date of dates) {
      for (const interval of settings.intervals) {
        if (interval.dayOfWeek.toLowerCase() === date.dayOfWeek.toLowerCase()) {
          const spotFrom = fromZonedTime(`${date.date} ${interval.timeFrom}`, settings.timezone);
          const spotTo = fromZonedTime(`${date.date} ${interval.timeTo}`, settings.timezone);
          const generated = this.generateTimeSpots({ from: spotFrom, to: spotTo, seconds });
          spots.push(...generated.filter((spot) => spot.from >= from && spot.to <= to));
        }
      }
    }
    return spots.sort((a, b) => a.from.getTime() - b.from.getTime());
  }
  private getSpotDates({
    from,
    to,
    timezone,
  }: {
    from: Date;
    to: Date;
    timezone: string;
  }): { date: string; dayOfWeek: string }[] {
    const dates: { date: string; dayOfWeek: string }[] = [];
    let currentDate = from;
    while (currentDate < to) {
      const tzCurrentDate = toZonedTime(currentDate, timezone);
      dates.push({
        date: DateUtil.format(tzCurrentDate, 'yyyy-MM-dd'),
        dayOfWeek: DateUtil.format(tzCurrentDate, 'EEEE'),
      });
      currentDate = DateUtil.add(currentDate, { days: 1 });
    }
    const tzDateTo = toZonedTime(to, timezone);
    dates.push({ date: DateUtil.format(tzDateTo, 'yyyy-MM-dd'), dayOfWeek: DateUtil.format(tzDateTo, 'EEEE') });
    return Array.from(new Map(dates.map((d) => [d.date, d])).values());
  }
  private generateTimeSpots({ from, to, seconds }: { from: Date; to: Date; seconds: number }): Spot[] {
    const spots: Spot[] = [];
    let spotFrom = from;
    let spotTo = DateUtil.add(spotFrom, { seconds });

    while (spotTo <= to) {
      spots.push({ from: spotFrom, to: spotTo });
      spotFrom = spotTo;
      spotTo = DateUtil.add(spotTo, { seconds });
    }
    return spots;
  }

  async update({
    accountId,
    user,
    appointmentId,
    dto,
    skipPermissionCheck,
    event,
  }: {
    accountId: number;
    user: User;
    appointmentId: number;
    dto: UpdateScheduleAppointmentDto;
    skipPermissionCheck?: boolean;
    event?: ServiceEvent;
  }): Promise<ScheduleAppointment> {
    const appointment = await this.getOne({ accountId, user, appointmentId });

    return this.updateAppointment({ accountId, user, appointment, dto, skipPermissionCheck, event });
  }

  async updateAppointment({
    accountId,
    user,
    appointment,
    dto,
    skipPermissionCheck,
    event,
  }: {
    accountId: number;
    user: User;
    appointment: ScheduleAppointment;
    dto: UpdateScheduleAppointmentDto;
    skipPermissionCheck?: boolean;
    event?: ServiceEvent;
  }): Promise<ScheduleAppointment> {
    if (!skipPermissionCheck && !appointment.userRights.canEdit) {
      throw new ForbiddenError();
    }

    if (!appointment.hasChanges(dto)) {
      return appointment;
    }

    appointment = appointment.update(dto);

    if (appointment.endDate <= appointment.startDate) {
      throw new AppointmentDatesConflictError();
    }

    if (dto.checkIntersection && (await this.hasIntersect(appointment))) {
      throw new AppointmentIntersectionError();
    }

    if (appointment.entityId) {
      await this.checkEntityDayLimit(appointment);
    }

    await this.repository.save(appointment);

    this.eventEmitter.emit(
      SchedulerEventType.ScheduleAppointmentUpdated,
      new SchedulerAppointmentUpdatedEvent({
        source: ScheduleAppointment.name,
        accountId,
        ownerId: appointment.ownerId,
        scheduleId: appointment.scheduleId,
        performerId: appointment.performerId,
        appointmentId: appointment.id,
        externalId: appointment.externalId,
        title: appointment.title,
        comment: appointment.comment,
        startDate: appointment.startDate,
        endDate: appointment.endDate,
        status: appointment.status,
        entityId: appointment.entityId,
        prevEvent: event,
      }),
    );

    return this.expandOne({ accountId, user, appointment, expand: ['prevAppointmentCount', 'entityInfo', 'order'] });
  }

  async changePerformer(accountId: number, oldPerformerId: number, newPerformerId: number): Promise<void> {
    await this.repository.update({ accountId, performerId: oldPerformerId }, { performerId: newPerformerId });
  }

  async delete({
    accountId,
    user,
    filter,
    event,
  }: {
    accountId: number;
    user?: User | null;
    filter: DeleteFilter;
    event?: ServiceEvent;
  }): Promise<void> {
    const appointments = await this.createFindQb({ filter: { accountId, ...filter } }).getMany();
    for (const appointment of appointments) {
      if (!user || (await this.authService.check({ action: 'delete', user, authorizable: appointment }))) {
        await this.repository.delete({ accountId, id: appointment.id });

        this.eventEmitter.emit(
          SchedulerEventType.ScheduleAppointmentDeleted,
          new SchedulerAppointmentEvent({
            source: ScheduleAppointment.name,
            accountId,
            ownerId: appointment.ownerId,
            scheduleId: appointment.scheduleId,
            performerId: appointment.performerId,
            appointmentId: appointment.id,
            entityId: appointment.entityId,
            externalId: appointment.externalId,
            prevEvent: event,
          }),
        );
      }
    }
  }

  async handleUpsertExt(event: SchedulerAppointmentExtUpsertEvent): Promise<ScheduleAppointment | null> {
    const schedule = await this.scheduleService.findOne({
      filter: { accountId: event.accountId, scheduleId: event.scheduleId },
    });
    const user = await this.userService.findOne({ accountId: event.accountId, id: event.ownerId });
    if (schedule && user) {
      const { accountId, appointmentId, externalId } = event;
      let appointment = externalId
        ? await this.findOne({ filter: { accountId, scheduleId: schedule.id, externalId, showCanceled: true } })
        : undefined;
      if (!appointment && appointmentId) {
        appointment = await this.findOne({
          filter: { accountId, scheduleId: schedule.id, appointmentId, showCanceled: true },
        });
      }

      if (appointment) {
        return this.updateAppointment({
          accountId,
          user,
          appointment,
          dto: {
            title: event.title,
            comment: event.comment,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
            status: event.status,
            externalId,
          },
          skipPermissionCheck: true,
          event,
        });
      } else {
        const performer = schedule.performers.find((p) => p.id === event.performerId);
        if (performer) {
          return this.create({
            accountId,
            user,
            dto: {
              scheduleId: schedule.id,
              startDate: event.startDate.toISOString(),
              endDate: event.endDate.toISOString(),
              status: event.status,
              title: event.title,
              comment: event.comment,
              performerId: performer.id,
              checkIntersection: false,
              ownerId: event.ownerId,
              externalId,
            },
            skipPermissionCheck: true,
            event,
          });
        }
      }
    }
    return null;
  }

  private createFindQb({
    filter,
    options,
  }: {
    filter: FindFilter;
    options?: FindOptions;
  }): SelectQueryBuilder<ScheduleAppointment> {
    const qb = this.repository
      .createQueryBuilder('appointment')
      .where('appointment.account_id = :accountId', { accountId: filter.accountId });

    if (options?.joinPerformer) {
      qb.leftJoinAndMapOne(
        'appointment.performer',
        SchedulePerformer,
        'performer',
        'appointment.performer_id = performer.id',
      );
    }

    if (filter.appointmentId) {
      if (Array.isArray(filter.appointmentId)) {
        qb.andWhere('appointment.id IN (:...appointmentIds)', { appointmentIds: filter.appointmentId });
      } else {
        qb.andWhere('appointment.id = :appointmentId', { appointmentId: filter.appointmentId });
      }
    }

    if (filter.externalId) {
      qb.andWhere('appointment.external_id = :externalId', { externalId: filter.externalId });
    }

    if (filter.scheduleId) {
      qb.andWhere('appointment.schedule_id = :scheduleId', { scheduleId: filter.scheduleId });
    }
    if (filter.entityId) {
      qb.andWhere('appointment.entity_id = :entityId', { entityId: filter.entityId });
    }
    if (filter.performerId) {
      qb.andWhere('appointment.performer_id = :performerId', { performerId: filter.performerId });
    }
    if (filter.status) {
      if (Array.isArray(filter.status)) {
        qb.andWhere('appointment.status IN (:...statuses)', { statuses: filter.status });
      } else {
        qb.andWhere('appointment.status = :status', { status: filter.status });
      }
    } else if (!filter.showCanceled) {
      qb.andWhere('appointment.status != :status', { status: ScheduleAppointmentStatus.Canceled });
    }
    if (filter.title) {
      qb.andWhere('appointment.title ILIKE :title', { title: `%${filter.title}%` });
    }

    if (options?.isSchedule) {
      if (filter.from && filter.to) {
        // eslint-disable-next-line max-len, prettier/prettier
        qb.andWhere('appointment.start_date < :to', { to: filter.to }).andWhere('appointment.end_date > :from', { from: filter.from });
      } else if (filter.from) {
        qb.andWhere('appointment.end_date >= :from', { from: filter.from });
      } else if (filter.to) {
        qb.andWhere('appointment.start_date <= :to', { to: filter.to });
      }
    } else {
      if (filter.from) {
        qb.andWhere('appointment.start_date >= :from', { from: filter.from });
      }
      if (filter.to) {
        qb.andWhere('appointment.end_date <= :to', { to: filter.to });
      }
    }
    if (filter.isNewbie && filter.from) {
      qb.andWhere('appointment.entityId IS NOT NULL').andWhere(
        `NOT EXISTS (SELECT 1 FROM schedule_appointment ia WHERE ia.schedule_id = appointment.schedule_id AND ` +
          `ia.entity_id IS NOT NULL AND ia.entity_id = appointment.entity_id ` +
          `AND ia.status != '${ScheduleAppointmentStatus.Canceled}' AND ia.end_date < appointment.start_date)`,
      );
    }
    if (filter.isNotScheduled) {
      qb.andWhere('appointment.entityId IS NOT NULL').andWhere(
        `NOT EXISTS (SELECT 1 FROM schedule_appointment fa WHERE fa.schedule_id = appointment.schedule_id AND ` +
          `fa.entity_id IS NOT NULL AND fa.entity_id = appointment.entity_id ` +
          `AND fa.status != '${ScheduleAppointmentStatus.Canceled}' AND fa.start_date > appointment.start_date)`,
      );
    }
    if (filter.isNotTookPlace) {
      qb.andWhere('appointment.status IN (:...filterNotTookPlaceStatuses)', {
        filterNotTookPlaceStatuses: [ScheduleAppointmentStatus.NotConfirmed, ScheduleAppointmentStatus.Confirmed],
      }).andWhere('appointment.end_date < now()');
    }

    return qb;
  }

  private async countPrevAppointment(accountId: number, appointment: ScheduleAppointment): Promise<number> {
    return appointment.entityId
      ? this.repository
          .createQueryBuilder('appointment')
          .where('appointment.account_id = :accountId', { accountId })
          .andWhere('appointment.entity_id = :entityId', { entityId: appointment.entityId })
          .andWhere('appointment.schedule_id = :scheduleId', { scheduleId: appointment.scheduleId })
          .andWhere('appointment.status != :canceled', { canceled: ScheduleAppointmentStatus.Canceled })
          .andWhere('appointment.end_date <= :endDate', { endDate: appointment.endDate })
          .getCount()
      : 1;
  }

  private async hasIntersect({
    id,
    accountId,
    scheduleId,
    performerId,
    startDate,
    endDate,
  }: ScheduleAppointment): Promise<boolean> {
    const appointments = await this.createFindQb({
      filter: { accountId, scheduleId, performerId, from: startDate, to: endDate },
      options: { isSchedule: true },
    }).getMany();

    return appointments.filter((a) => a.id !== id).length > 0;
  }

  private async checkEntityDayLimit({ id, accountId, scheduleId, entityId, startDate, endDate }: ScheduleAppointment) {
    const schedule = await this.scheduleService.findOne({ filter: { accountId, scheduleId } });
    if (schedule.oneEntityPerDay) {
      const other = await this.createFindQb({
        filter: {
          accountId,
          scheduleId,
          entityId,
          from: DateUtil.startOf(startDate, 'day'),
          to: DateUtil.endOf(endDate, 'day'),
        },
      }).getOne();
      if (other && other.id !== id) {
        throw new AppointmentDayLimitError({ appointmentId: other.id });
      }
    }
  }

  private async expandOne({
    accountId,
    user,
    appointment,
    expand,
  }: {
    accountId: number;
    user: User;
    appointment: ScheduleAppointment;
    expand: ExpandableField[];
  }): Promise<ScheduleAppointment> {
    if (expand.includes('prevAppointmentCount')) {
      appointment.prevAppointmentCount = await this.countPrevAppointment(accountId, appointment);
    }
    if (expand.includes('order') && appointment.orderId) {
      appointment.order = await this.orderService.findOne(
        accountId,
        user,
        { orderId: appointment.orderId },
        { expand: ['items', 'shipments'] },
      );
    }
    if (expand.includes('entityInfo') && appointment.entityId) {
      appointment.entityInfo = await this.entityInfoService.findOne({
        accountId,
        user,
        entityId: appointment.entityId,
      });
    }
    return appointment;
  }
}
