import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { convert } from 'html-to-text';

import { DateUtil, FileLinkSource, NotFoundError } from '@/common';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { UserService } from '@/modules/iam/user/user.service';
import { ActionActivityCreateSettings, ActionHelper } from '@/modules/automation';
import { EntityInfoService } from '@/modules/entity/entity-info';
import { NotificationType } from '@/modules/notification/notification/enums/notification-type.enum';
import { CreateNotificationDto } from '@/modules/notification/notification/dto/create-notification.dto';

import { ActivityCreatedEvent, ActivityEvent, CrmEventType } from '../common';
import { ActivityTypeService } from '../activity-type/activity-type.service';
import { BaseTaskService } from '../base-task';
import { FileLinkService } from '../Service/FileLink/FileLinkService';

import { Activity } from './entities';
import { ActivityDto, CreateActivityDto, UpdateActivityDto } from './dto';

interface FindFilter {
  accountId: number;
  activityId?: number | number;
  entityId?: number;
  isResolved?: boolean;
  responsibles?: number | number[];
}

@Injectable()
export class ActivityService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Activity)
    private readonly repository: Repository<Activity>,
    private readonly authService: AuthorizationService,
    private readonly userService: UserService,
    private readonly activityTypeService: ActivityTypeService,
    private readonly fileLinkService: FileLinkService,
    private readonly baseTaskService: BaseTaskService,
    private readonly entityInfoService: EntityInfoService,
  ) {}

  public async create(
    accountId: number,
    user: User,
    dto: CreateActivityDto,
    options?: { skipPermissionCheck?: boolean },
  ): Promise<Activity> {
    if (!options?.skipPermissionCheck) {
      await this.authService.check({
        action: 'create',
        user,
        authorizable: Activity.getAuthorizable(),
        throwError: true,
      });
    }

    dto.weight = dto.weight ?? (await this.baseTaskService.calculateWeight(accountId, dto.afterId, dto.beforeId));
    const activity = await this.repository.save(Activity.create(accountId, user.id, dto));

    if (dto.fileIds) {
      await this.fileLinkService.processFiles(accountId, FileLinkSource.ACTIVITY, activity.id, dto.fileIds);
    }

    const activityType = await this.activityTypeService.findOne({ accountId, id: dto.activityTypeId });

    this.eventEmitter.emit(
      CrmEventType.ActivityCreated,
      new ActivityCreatedEvent({
        accountId,
        activityId: activity.id,
        ownerId: activity.responsibleUserId,
        entityId: activity.entityId,
        createdBy: activity.createdBy,
        activityText: activity.text,
        activityTypeName: activityType.name,
        createdAt: activity.createdAt.toISOString(),
      }),
    );

    return activity;
  }

  public async createAndGetDto(account: Account, user: User, dto: CreateActivityDto): Promise<ActivityDto> {
    const activity = await this.create(account.id, user, dto);

    return await this.createDtoForActivity(account, user, activity);
  }

  public async findOne(filter: FindFilter): Promise<Activity | null> {
    return this.createFindQb(filter).getOne();
  }
  public async findMany(filter: FindFilter): Promise<Activity[]> {
    return this.createFindQb(filter).orderBy('activity.id', 'DESC').getMany();
  }

  public async update(account: Account, user: User, id: number, dto: UpdateActivityDto): Promise<ActivityDto> {
    let activity = await this.repository.findOneBy({ id });
    if (!activity) {
      throw NotFoundError.withId(Activity, id);
    }

    await this.authService.check({ action: 'edit', user, authorizable: activity, throwError: true });

    if (dto.sorting) {
      activity.weight = await this.baseTaskService.calculateWeight(
        account.id,
        dto.sorting.afterId,
        dto.sorting.beforeId,
      );
    }
    activity = await this.repository.save(activity.update(dto));

    if (dto.fileIds !== undefined) {
      await this.fileLinkService.processFiles(account.id, FileLinkSource.ACTIVITY, id, dto.fileIds ?? []);
    }

    this.eventEmitter.emit(
      CrmEventType.ActivityUpdated,
      new ActivityEvent({ accountId: account.id, entityId: activity.entityId, activityId: id }),
    );

    return await this.createDtoForActivity(account, user, activity);
  }

  public async delete(accountId: number, user: User, id: number) {
    const activity = await this.repository.findOneBy({ id });
    await this.authService.check({ action: 'delete', user, authorizable: activity, throwError: true });

    await this.fileLinkService.processFiles(accountId, FileLinkSource.ACTIVITY, id, []);
    const result = await this.repository.delete({ id });
    if (result.affected === 0) {
      throw NotFoundError.withId(Activity, id);
    }

    this.eventEmitter.emit(
      CrmEventType.ActivityDeleted,
      new ActivityEvent({ accountId, entityId: activity.entityId, activityId: id }),
    );
  }

  public async findDtoForId(account: Account, user: User, id: number): Promise<ActivityDto | null> {
    const activity = await this.repository.findOneBy({ id });
    return activity ? await this.createDtoForActivity(account, user, activity) : null;
  }

  public async createDtoForActivity(account: Account, user: User, activity: Activity): Promise<ActivityDto | null> {
    if (!(await this.authService.check({ action: 'view', user, authorizable: activity }))) {
      return null;
    }

    const entityInfo = activity.entityId
      ? await this.entityInfoService.findOne({
          accountId: account.id,
          user,
          entityId: activity.entityId,
        })
      : null;
    const fileLinks = await this.fileLinkService.getFileLinkDtos(account, FileLinkSource.ACTIVITY, activity.id);
    const userRights = await this.authService.getUserRights({ user, authorizable: activity });

    return new ActivityDto(activity, entityInfo, fileLinks, userRights);
  }

  public async changeResponsible({
    accountId,
    currentUserId,
    newUserId,
  }: {
    accountId: number;
    currentUserId: number;
    newUserId: number;
  }) {
    await this.repository.update({ accountId, responsibleUserId: currentUserId }, { responsibleUserId: newUserId });
  }

  public async processAutomation({
    accountId,
    entityId,
    entityOwnerId,
    entityStageId,
    settings,
  }: {
    accountId: number;
    entityId: number;
    entityOwnerId: number;
    entityStageId: number | null | undefined;
    settings: ActionActivityCreateSettings;
  }): Promise<Activity | null> {
    const entity = await this.entityInfoService.findOne({ accountId, entityId });
    if (entity && (!entity.stageId || settings.allowAnyStage || entity.stageId === entityStageId)) {
      const user = await this.userService.findOne({ accountId, id: entityOwnerId });
      const ownerId = settings.responsibleUserId ?? entityOwnerId;
      const startDate = DateUtil.add(DateUtil.now(), { seconds: settings.deferStart ?? 0 });
      const endDate = ActionHelper.getEndDate({
        startDate,
        deadlineType: settings.deadlineType,
        deadlineTime: settings.deadlineTime,
      });
      return this.create(
        accountId,
        user,
        {
          responsibleUserId: ownerId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          activityTypeId: settings.activityTypeId,
          text: settings.text,
          entityId,
        },
        { skipPermissionCheck: true },
      );
    }
    return null;
  }

  public async getOverdueNotifications(from: Date, to: Date): Promise<CreateNotificationDto[]> {
    const activities = await this.repository
      .createQueryBuilder('activity')
      .where('activity.is_resolved = false')
      .andWhere('activity.end_date > :from', { from })
      .andWhere('activity.end_date <= :to', { to })
      .getMany();
    return activities.map(
      (activity) =>
        new CreateNotificationDto(
          activity.accountId,
          activity.responsibleUserId,
          NotificationType.ACTIVITY_OVERDUE,
          activity.id,
          activity.entityId,
          activity.createdBy,
          null,
          convert(activity.text),
        ),
    );
  }

  public async getOverdueForFollowNotifications(
    notifyUserId: number,
    from: Date,
    to: Date,
    followUserIds: number[],
  ): Promise<CreateNotificationDto[]> {
    const activities = await this.repository
      .createQueryBuilder('activity')
      .where('activity.is_resolved = false')
      .andWhere('activity.end_date > :from', { from })
      .andWhere('activity.end_date <= :to', { to })
      .andWhere('activity.responsible_user_id in (:...userIds)', { userIds: followUserIds })
      .getMany();
    return activities.map(
      (activity) =>
        new CreateNotificationDto(
          activity.accountId,
          notifyUserId,
          NotificationType.ACTIVITY_OVERDUE_EMPLOYEE,
          activity.id,
          activity.entityId,
          activity.responsibleUserId,
          null,
          convert(activity.text),
        ),
    );
  }

  public async getBeforeStartNotifications(userId: number, from: Date, to: Date) {
    const activities = await this.repository
      .createQueryBuilder('activity')
      .where('activity.is_resolved = false')
      .andWhere('activity.responsible_user_id = :userId', { userId })
      .andWhere('activity.start_date > :from', { from })
      .andWhere('activity.start_date <= :to', { to })
      .getMany();
    return activities.map(
      (activity) =>
        new CreateNotificationDto(
          activity.accountId,
          activity.responsibleUserId,
          NotificationType.ACTIVITY_BEFORE_START,
          activity.id,
          activity.entityId,
          activity.createdBy,
          null,
          convert(activity.text),
        ),
    );
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('activity')
      .where('activity.accountId = :accountId', { accountId: filter.accountId });
    if (filter.activityId) {
      if (Array.isArray(filter.activityId)) {
        qb.andWhere('activity.id IN (:...activityIds)', { activityIds: filter.activityId });
      } else {
        qb.andWhere('activity.id = :activityId', { activityId: filter.activityId });
      }
    }
    if (filter.entityId) {
      qb.andWhere('activity.entity_id = :entityId', { entityId: filter.entityId });
    }
    if (filter.isResolved !== undefined) {
      qb.andWhere('activity.is_resolved = :isResolved', { isResolved: filter.isResolved });
    }
    if (filter.responsibles) {
      if (Array.isArray(filter.responsibles)) {
        if (filter.responsibles.length === 0) {
          return qb.where('1 = 0');
        }
        qb.andWhere('activity.responsible_user_id IN (:...responsibles)', { responsibles: filter.responsibles });
      } else {
        qb.andWhere('activity.responsible_user_id = :responsible', { responsible: filter.responsibles });
      }
    }

    return qb;
  }
}
