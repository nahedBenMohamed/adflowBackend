import { Injectable } from '@nestjs/common';

import { isUnique } from '@/common';
import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { FieldType } from '@/modules/entity/entity-field/common/enums/field-type.enum';
import { FieldValueService } from '@/modules/entity/entity-field/field-value/field-value.service';
import { FieldService } from '@/modules/entity/entity-field/field/field.service';

import { EntityCategory } from '../../common';
import { Activity } from '../../activity/entities';
import { ActivityService } from '../../activity/activity.service';
import { BaseTask } from '../../base-task';
import { EntityLink } from '../../entity-link/entities';
import { EntityLinkService } from '../../entity-link/entity-link.service';
import { EntityType } from '../../entity-type/entities';
import { EntityTypeLinkService } from '../../entity-type-link/entity-type-link.service';
import { Task } from '../../task/entities';
import { TaskService } from '../../task/task.service';

import { Entity } from '../../Model/Entity/Entity';

import { TaskIndicator } from './enums/task-indicator.enum';
import { EntityBoardCard } from './Dto/Board/EntityBoardCard';
import { CommonEntityCard } from './Dto/Board/CommonEntityCard';
import { EntityService } from './EntityService';

@Injectable()
export class CommonEntityBoardCardService {
  constructor(
    private readonly authService: AuthorizationService,
    private readonly entityService: EntityService,
    private readonly entityLinkService: EntityLinkService,
    private readonly entityTypeLinkService: EntityTypeLinkService,
    private readonly fieldService: FieldService,
    private readonly fieldValueService: FieldValueService,
    private readonly taskService: TaskService,
    private readonly activityService: ActivityService,
  ) {}

  public async getBoardCard(
    accountId: number,
    user: User,
    entity: Entity,
    entityCategory: EntityCategory,
  ): Promise<EntityBoardCard> {
    const links = await this.entityLinkService.findMany({ accountId, sourceId: entity.id });
    const linkedIds = links.map((l) => l.targetId).filter(isUnique);
    const linkedEntities = linkedIds.length
      ? await this.entityService.findMany(accountId, { entityId: linkedIds })
      : [];

    const linkedEntityTypes = await this.entityTypeLinkService.findMany({ accountId, sourceId: entity.entityTypeId });
    const allowedEntityTypeLinks = (
      await Promise.all(
        linkedEntityTypes.map(async (linked) => {
          const hasAccess = await this.authService.check({
            action: 'view',
            user,
            authorizable: EntityType.getAuthorizable(linked.targetId),
          });
          return hasAccess ? linked : null;
        }),
      )
    ).filter(Boolean);

    const sortOrderMap: Record<number, number> = {};
    allowedEntityTypeLinks.forEach((link) => {
      sortOrderMap[link.targetId] = link.sortOrder;
    });

    const filteredLinkedEntities = linkedEntities.filter((e) =>
      allowedEntityTypeLinks.some((etl) => etl.targetId === e.entityTypeId),
    );

    const priceField = await this.fieldService.findOne({
      accountId,
      entityTypeId: entity.entityTypeId,
      type: FieldType.Value,
    });

    const taskResponsibles = await this.authService.whoCanView({ user, authorizable: Task.getAuthorizable() });
    const activityResponsibles = await this.authService.whoCanView({ user, authorizable: Activity.getAuthorizable() });

    return this.createBoardCard({
      accountId,
      user,
      entity,
      entityCategory,
      sortOrderMap,
      linksCache: links,
      entityCache: filteredLinkedEntities,
      priceFieldId: priceField?.id,
      taskResponsibles,
      activityResponsibles,
    });
  }

  public async getBoardCards(
    accountId: number,
    user: User,
    entityTypeId: number,
    entities: Entity[],
    entityCategory: EntityCategory,
  ): Promise<EntityBoardCard[]> {
    const links = await this.entityLinkService.findMany({ accountId, sourceId: entities.map((e) => e.id) });
    const linkedIds = links.map((l) => l.targetId).filter(isUnique);
    const linkedEntities = linkedIds.length
      ? await this.entityService.findMany(accountId, { entityId: linkedIds })
      : [];

    const linkedEntityTypes = await this.entityTypeLinkService.findMany({ accountId, sourceId: entityTypeId });
    const allowedEntityTypeLinks = (
      await Promise.all(
        linkedEntityTypes.map(async (linked) => {
          const hasAccess = await this.authService.check({
            action: 'view',
            user,
            authorizable: EntityType.getAuthorizable(linked.targetId),
          });
          return hasAccess ? linked : null;
        }),
      )
    ).filter(Boolean);
    const sortOrderMap: Record<number, number> = {};
    allowedEntityTypeLinks.forEach((link) => {
      sortOrderMap[link.targetId] = link.sortOrder;
    });
    const filteredLinkedEntities = linkedEntities.filter((e) =>
      allowedEntityTypeLinks.some((etl) => etl.targetId === e.entityTypeId),
    );

    const priceField = await this.fieldService.findOne({ accountId, entityTypeId, type: FieldType.Value });

    const taskResponsibles = await this.authService.whoCanView({ user, authorizable: Task.getAuthorizable() });
    const activityResponsibles = await this.authService.whoCanView({ user, authorizable: Activity.getAuthorizable() });

    const cards = await Promise.all(
      entities.map(async (entity, idx) => {
        const card = await this.createBoardCard({
          accountId,
          user,
          entity,
          entityCategory,
          sortOrderMap,
          linksCache: links,
          entityCache: filteredLinkedEntities,
          priceFieldId: priceField?.id,
          taskResponsibles,
          activityResponsibles,
        });
        return { idx, card };
      }),
    );

    return cards.sort((a, b) => a.idx - b.idx).map((c) => c.card);
  }

  private async createBoardCard({
    accountId,
    user,
    entity,
    entityCategory,
    sortOrderMap,
    linksCache,
    entityCache,
    priceFieldId,
    taskResponsibles,
    activityResponsibles,
  }: {
    accountId: number;
    user: User;
    entity: Entity;
    entityCategory: EntityCategory;
    sortOrderMap: Record<number, number>;
    linksCache: EntityLink[];
    entityCache: Entity[];
    priceFieldId: number | null | undefined;
    taskResponsibles: number[] | undefined;
    activityResponsibles: number[] | undefined;
  }): Promise<EntityBoardCard> {
    const targets = linksCache.filter((l) => l.sourceId === entity.id).map((l) => l.targetId);
    const linkedEntities = entityCache
      .filter((ec) => targets.includes(ec.id))
      .sort((a, b) => (sortOrderMap[a.entityTypeId] || 0) - (sortOrderMap[b.entityTypeId] || 0));
    const price = await this.getPrice(accountId, entity, priceFieldId);
    const taskIndicatorColor = await this.getTaskIndicatorColor({
      accountId,
      entityId: entity.id,
      taskResponsibles,
      activityResponsibles,
    });
    const userRights = await this.authService.getUserRights({ user, authorizable: entity });
    return new EntityBoardCard({
      id: entity.id,
      entityCategory,
      boardId: entity.boardId,
      stageId: entity.stageId,
      price,
      weight: entity.weight,
      focused: entity.focused,
      closedAt: entity.closedAt?.toISOString() ?? null,
      data: CommonEntityCard.create(
        entity,
        linkedEntities.map((le) => le.name),
        taskIndicatorColor,
        userRights,
      ),
    });
  }

  private async getPrice(
    accountId: number,
    entity: Entity,
    priceFieldId: number | null | undefined,
  ): Promise<number | null> {
    if (!priceFieldId) return null;

    const fieldValue = await this.fieldValueService.findOne({ accountId, entityId: entity.id, fieldId: priceFieldId });
    if (!fieldValue) return null;

    const value = fieldValue.getValue<number>();
    return isNaN(value) ? null : value;
  }

  private async getTaskIndicatorColor({
    accountId,
    entityId,
    taskResponsibles,
    activityResponsibles,
  }: {
    accountId: number;
    entityId: number;
    taskResponsibles: number[] | undefined;
    activityResponsibles: number[] | undefined;
  }): Promise<TaskIndicator> {
    const tasks: BaseTask[] =
      !taskResponsibles || taskResponsibles.length
        ? await this.taskService.findMany({
            accountId,
            entityId,
            responsibles: taskResponsibles,
            isResolved: false,
          })
        : [];
    const activities: BaseTask[] =
      !activityResponsibles || activityResponsibles.length
        ? await this.activityService.findMany({
            accountId,
            entityId,
            responsibles: activityResponsibles,
            isResolved: false,
          })
        : [];
    const allTasks = [...tasks, ...activities];

    if (allTasks.length === 0) return TaskIndicator.Empty;

    const expiredTask = allTasks.find((task) => task.isTaskExpired());
    if (expiredTask) return TaskIndicator.Overdue;

    const todayTask = allTasks.find((task) => task.isTaskToday());
    if (todayTask) return TaskIndicator.Today;

    return TaskIndicator.Upcoming;
  }
}
