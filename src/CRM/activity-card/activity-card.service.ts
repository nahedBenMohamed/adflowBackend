import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DatePeriod, DatePeriodDto, isUnique, PagingQuery } from '@/common';
import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { EntityInfoDto, EntityInfoService } from '@/modules/entity/entity-info';

import { Activity } from '../activity';
import { ActivityTypeService } from '../activity-type';
import { TaskBoardQueryHelper } from '../Service/BaseTaskBoard/TaskBoardQueryHelper';

import {
  ActivityCalendarMetaDto,
  ActivityCardDto,
  ActivityCardFilterDto,
  ActivityCardMetaDto,
  ActivityCardTypeMetaDto,
} from './dto';

@Injectable()
export class ActivityCardService {
  constructor(
    @InjectRepository(Activity)
    private readonly repository: Repository<Activity>,
    private readonly authService: AuthorizationService,
    private readonly activityTypeService: ActivityTypeService,
    private readonly entityInfoService: EntityInfoService,
  ) {}

  public async getActivityCards(
    accountId: number,
    user: User,
    filter: ActivityCardFilterDto,
    paging: PagingQuery,
  ): Promise<ActivityCardDto[]> {
    const userIds = await this.authService.whoCanView({ user, authorizable: Activity.getAuthorizable() });

    const typeIds = filter.typeIds ?? (await this.activityTypeService.findManyIds({ accountId }));

    const qb = TaskBoardQueryHelper.createBoardQueryBuilder(
      accountId,
      user.id,
      this.repository,
      filter,
      userIds,
      true,
      'text',
    );
    const activities: Activity[] = [];
    for (const typeId of typeIds) {
      const typedActivities = await qb
        .clone()
        .andWhere('activity_type_id = :typeId', { typeId })
        .andWhere('is_resolved = :isResolved', { isResolved: false })
        .offset(paging.skip)
        .limit(paging.take)
        .getMany();
      activities.push(...typedActivities);
    }
    if (filter.showResolved !== false) {
      const resolvedActivities = await qb
        .clone()
        .andWhere('is_resolved = :isResolved', { isResolved: true })
        .offset(paging.skip)
        .limit(paging.take)
        .getMany();
      activities.push(...resolvedActivities);
    }
    const entityIds = activities.map((activity) => activity.entityId).filter(isUnique);
    const entityInfoCache = entityIds.length
      ? await this.entityInfoService.findMany({ accountId, user, entityIds })
      : [];

    const activityCards: ActivityCardDto[] = [];
    for (const activity of activities) {
      const entityInfo = entityInfoCache.find((ei) => ei.id === activity.entityId);
      activityCards.push(await this.createActivityCard(user, activity, entityInfo));
    }
    return activityCards;
  }

  public async getActivityCard(
    accountId: number,
    user: User,
    activityId: number,
    filter: ActivityCardFilterDto,
  ): Promise<ActivityCardDto | null> {
    const userIds = await this.authService.whoCanView({ user, authorizable: Activity.getAuthorizable() });

    const qb = TaskBoardQueryHelper.createBoardQueryBuilder(
      accountId,
      user.id,
      this.repository,
      filter,
      userIds,
      false,
      'text',
    );
    if (filter.showResolved === false) {
      qb.andWhere('is_resolved = :isResolved', { isResolved: false });
    }

    const activity = await qb.andWhere('id = :id', { id: activityId }).getOne();

    if (!activity) return null;

    const entityInfo = activity.entityId
      ? await this.entityInfoService.findOne({ accountId, user, entityId: activity.entityId })
      : null;

    return await this.createActivityCard(user, activity, entityInfo);
  }

  public async getActivityCardsMeta(
    accountId: number,
    user: User,
    filter: ActivityCardFilterDto,
  ): Promise<ActivityCardMetaDto> {
    const userIds = await this.authService.whoCanView({ user, authorizable: Activity.getAuthorizable() });

    const typeIds = filter.typeIds ?? (await this.activityTypeService.findManyIds({ accountId }));

    const qb = TaskBoardQueryHelper.createBoardQueryBuilder(
      accountId,
      user.id,
      this.repository,
      filter,
      userIds,
      false,
      'text',
    );
    let totalCount = 0;
    const typeMeta: ActivityCardTypeMetaDto[] = [];
    for (const typeId of typeIds) {
      const count = await qb
        .clone()
        .andWhere('activity_type_id = :typeId', { typeId })
        .andWhere('is_resolved = :isResolved', { isResolved: false })
        .getCount();
      typeMeta.push(new ActivityCardTypeMetaDto(typeId, count));
      totalCount += count;
    }
    let resolvedCount = 0;
    if (filter.showResolved !== false) {
      resolvedCount = await qb.clone().andWhere('is_resolved = :isResolved', { isResolved: true }).getCount();
      totalCount += resolvedCount;
    }

    return new ActivityCardMetaDto(totalCount, typeMeta, resolvedCount);
  }

  public async createActivityCard(
    user: User,
    activity: Activity,
    entityInfo: EntityInfoDto | null,
  ): Promise<ActivityCardDto> {
    const userRights = await this.authService.getUserRights({ user, authorizable: activity });

    return new ActivityCardDto(activity, entityInfo, [], userRights);
  }

  public async getActivityCalendar(
    accountId: number,
    user: User,
    periodDto: DatePeriodDto,
    filter: ActivityCardFilterDto,
  ): Promise<ActivityCardDto[]> {
    const userIds = await this.authService.whoCanView({ user, authorizable: Activity.getAuthorizable() });

    const qb = TaskBoardQueryHelper.createBoardQueryBuilder(
      accountId,
      user.id,
      this.repository,
      filter,
      userIds,
      true,
      'text',
    );

    const typeIds = filter.typeIds ?? (await this.activityTypeService.findManyIds({ accountId }));
    if (typeIds) {
      qb.andWhere('activity_type_id IN (:...typeIds)', { typeIds });
    }
    if (filter.showResolved === false) {
      qb.andWhere('is_resolved = :isResolved', { isResolved: false });
    }

    const period = DatePeriod.fromDto(periodDto);
    if (period.from && period.to) {
      qb.andWhere('start_date < :to', { to: period.to }).andWhere('end_date > :from', { from: period.from });
    }

    const activities = await qb.getMany();

    const entityIds = activities.map((activity) => activity.entityId).filter(isUnique);
    const entityInfoCache = entityIds.length
      ? await this.entityInfoService.findMany({ accountId, user, entityIds })
      : [];

    const activityCards: ActivityCardDto[] = [];
    for (const activity of activities) {
      const entityInfo = entityInfoCache.find((ei) => ei.id === activity.entityId);
      activityCards.push(await this.createActivityCard(user, activity, entityInfo));
    }
    return activityCards;
  }

  public async getActivityCalendarMeta(
    accountId: number,
    user: User,
    periodDto: DatePeriodDto,
    filter: ActivityCardFilterDto,
  ): Promise<ActivityCalendarMetaDto> {
    const userIds = await this.authService.whoCanView({ user, authorizable: Activity.getAuthorizable() });

    const qb = TaskBoardQueryHelper.createBoardQueryBuilder(
      accountId,
      user.id,
      this.repository,
      filter,
      userIds,
      true,
      'text',
    );

    const typeIds = filter.typeIds ?? (await this.activityTypeService.findManyIds({ accountId }));
    if (typeIds) {
      qb.andWhere('activity_type_id IN (:...typeIds)', { typeIds });
    }
    if (filter.showResolved === false) {
      qb.andWhere('is_resolved = :isResolved', { isResolved: false });
    }

    const period = DatePeriod.fromDto(periodDto);
    if (period.from && period.to) {
      qb.andWhere('start_date < :to', { to: period.to }).andWhere('end_date > :from', { from: period.from });
    }
    const total = await qb.getCount();

    return new ActivityCalendarMetaDto({ total });
  }
}
