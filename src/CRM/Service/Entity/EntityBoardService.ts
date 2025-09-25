import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';

import {
  BooleanFilter,
  DateFilter,
  DatePeriod,
  DateUtil,
  ExistsFilter,
  ExistsFilterType,
  intersection,
  NumberFilter,
  PagingQuery,
  SelectFilter,
  SimpleFilterType,
  StringFilter,
  StringFilterType,
  UserNotification,
} from '@/common';
import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { FieldType } from '@/modules/entity/entity-field/common/enums/field-type.enum';
import { FieldValue } from '@/modules/entity/entity-field/field-value/entities/field-value.entity';
import { FieldValueService } from '@/modules/entity/entity-field/field-value/field-value.service';
import { FieldService } from '@/modules/entity/entity-field/field/field.service';
import { Field } from '@/modules/entity/entity-field/field/entities/field.entity';

import { EntityCategory } from '../../common';
import { BoardStageService } from '../../board-stage';
import { EntityType } from '../../entity-type/entities/entity-type.entity';
import { EntityTypeService } from '../../entity-type/entity-type.service';

import { Entity } from '../../Model/Entity/Entity';

import { ProjectEntityBoardCardService } from './ProjectEntityBoardCardService';
import { CommonEntityBoardCardService } from './CommonEntityBoardCardService';
import { EntityService } from './EntityService';

import { EntityBoardCardFilter } from '../../Controller/Entity/Board/Filter/EntityBoardCardFilter';
import { EntitySorting } from '../../Controller/Entity/Board/Filter/EntitySorting';
import { EntityTaskFilter } from '../../Controller/Entity/Board/Filter/entity-task-filter.enum';
import { EntityFieldFilter } from '../../Controller/Entity/Board/Filter/EntityFieldFilter';
import {
  EntityBoardCard,
  EntityBoardMeta,
  EntityBoardStageMeta,
  EntityListItem,
  EntityListMeta,
  UpdateEntitiesBatchFilterDto,
  DeleteEntitiesBatchFilterDto,
} from './Dto';

const EntityBatchLimit = 50;

@Injectable()
export class EntityBoardService {
  constructor(
    @InjectRepository(Entity)
    private readonly repository: Repository<Entity>,
    private readonly dataSource: DataSource,
    private readonly authService: AuthorizationService,
    private readonly fieldValueService: FieldValueService,
    private readonly entityTypeService: EntityTypeService,
    private readonly stageService: BoardStageService,
    private readonly fieldService: FieldService,
    private readonly entityService: EntityService,
    private readonly commonBoardCardService: CommonEntityBoardCardService,
    private readonly projectBoardCardService: ProjectEntityBoardCardService,
  ) {}

  async getEntityBoardCards({
    accountId,
    user,
    entityTypeId,
    boardId,
    filter,
    paging,
  }: {
    accountId: number;
    user: User;
    entityTypeId: number;
    boardId: number;
    filter: EntityBoardCardFilter;
    paging: PagingQuery;
  }): Promise<EntityBoardCard[]> {
    const stageIds = await this.getStageIds({
      accountId,
      boardId,
      includeStageIds: filter.includeStageIds,
      excludeStageIds: filter.excludeStageIds,
    });
    if (!stageIds?.length) {
      return [];
    }

    const qb = await this.createFilteredQb({
      accountId,
      user,
      entityTypeId,
      filter,
      sorting: filter.sorting ?? EntitySorting.Manual,
    });

    const entityIds = (
      await Promise.all(
        stageIds.map(async (stageId) => {
          return (
            await qb
              .clone()
              .andWhere('e.stage_id = :stageId', { stageId })
              .offset(paging.skip)
              .limit(paging.take)
              .getRawMany<{ id: number }>()
          ).map((i) => i.id);
        }),
      )
    ).flat();

    if (entityIds.length) {
      const entities = await this.entityService.getByIdsOrdered({ accountId, entityIds });
      const entityType = await this.entityTypeService.findOne(accountId, { id: entityTypeId });
      return entityType.entityCategory === EntityCategory.PROJECT
        ? this.projectBoardCardService.getBoardCards(accountId, user, entityTypeId, entities, entityType.entityCategory)
        : this.commonBoardCardService.getBoardCards(accountId, user, entityTypeId, entities, entityType.entityCategory);
    } else {
      return [];
    }
  }

  async getEntityBoardCard({
    accountId,
    user,
    entityTypeId,
    boardId,
    entityId,
    filter,
  }: {
    accountId: number;
    user: User;
    entityTypeId: number;
    boardId: number;
    entityId: number;
    filter: EntityBoardCardFilter;
  }): Promise<EntityBoardCard | null> {
    const stageIds = await this.getStageIds({
      accountId,
      boardId,
      includeStageIds: filter.includeStageIds,
      excludeStageIds: filter.excludeStageIds,
    });
    if (!stageIds?.length) {
      return null;
    }

    const qb = await this.createFilteredQb({ accountId, user, entityTypeId, stageIds, filter });

    const filteredEntityId = await qb.andWhere('e.id = :entityId', { entityId }).getRawOne<{ id: number }>();

    if (!filteredEntityId?.id) {
      return null;
    }

    const entity = await this.entityService.findOne(accountId, { entityId });
    const entityType = await this.entityTypeService.findOne(accountId, { id: entityTypeId });
    return entityType.entityCategory === EntityCategory.PROJECT
      ? await this.projectBoardCardService.getBoardCard(accountId, user, entity, entityType.entityCategory)
      : await this.commonBoardCardService.getBoardCard(accountId, user, entity, entityType.entityCategory);
  }

  async getEntityBoardMeta({
    accountId,
    user,
    entityTypeId,
    boardId,
    filter,
  }: {
    accountId: number;
    user: User;
    entityTypeId: number;
    boardId: number;
    filter: EntityBoardCardFilter;
  }): Promise<EntityBoardMeta> {
    const stageIds = await this.getStageIds({
      accountId,
      boardId,
      includeStageIds: filter.includeStageIds,
      excludeStageIds: filter.excludeStageIds,
    });
    const hasPrice = await this.fieldService.hasPriceField({ accountId, entityTypeId });
    if (!stageIds?.length) {
      return { totalCount: 0, hasPrice, totalPrice: hasPrice ? 0 : null, stages: [] };
    }

    const qb = await this.createFilteredQb({ accountId, user, entityTypeId, filter });

    const stageMetas: EntityBoardStageMeta[] = await Promise.all(
      stageIds.map(async (stageId) => {
        const stageQb = qb.clone().andWhere('e.stage_id = :stageId', { stageId });

        const count = await stageQb.getCount();
        const price = hasPrice ? await this.getTotalPrice(stageQb) : null;

        return { id: stageId, totalCount: count, totalPrice: price };
      }),
    );

    const totalCount = stageMetas.reduce((acc, cur) => acc + cur.totalCount, 0);
    const totalPrice = hasPrice ? stageMetas.reduce((acc, cur) => acc + cur.totalPrice, 0) : null;

    return { totalCount, hasPrice, totalPrice, stages: stageMetas };
  }

  /**
   * @deprecated Use @see EntityService findMany
   */
  async getEntityBoardEntities(
    accountId: number,
    user: User,
    entityTypeId: number,
    boardId: number,
    paging: PagingQuery,
  ): Promise<Entity[]> {
    await this.authService.check({
      action: 'view',
      user,
      authorizable: EntityType.getAuthorizable(entityTypeId),
      throwError: true,
    });

    return this.entityService.findMany(accountId, { boardId }, paging);
  }

  async getEntityListItems({
    accountId,
    user,
    entityTypeId,
    boardId,
    filter,
    paging,
  }: {
    accountId: number;
    user: User;
    entityTypeId: number;
    boardId: number | null;
    filter: EntityBoardCardFilter;
    paging: PagingQuery;
  }): Promise<EntityListItem[]> {
    const stageIds = await this.getStageIds({
      accountId,
      boardId,
      includeStageIds: filter.includeStageIds,
      excludeStageIds: filter.excludeStageIds,
    });
    if (boardId && stageIds?.length === 0) {
      return [];
    }

    const qb = await this.createFilteredQb({
      accountId,
      user,
      entityTypeId,
      stageIds: boardId ? stageIds : undefined,
      filter,
      sorting: filter.sorting ?? EntitySorting.Manual,
    });

    const entityIds = (await qb.offset(paging.skip).limit(paging.take).getRawMany<{ id: number }>()).map((e) => e.id);

    return entityIds.length ? this.createListItems({ accountId, user, entityIds }) : [];
  }

  async getEntityListItem({
    accountId,
    user,
    entityTypeId,
    entityId,
    filter,
  }: {
    accountId: number;
    user: User;
    entityTypeId: number;
    entityId: number;
    filter: EntityBoardCardFilter;
  }): Promise<EntityListItem> {
    const qb = await this.createFilteredQb({
      accountId,
      user,
      entityTypeId,
      stageIds: filter.includeStageIds?.length ? filter.includeStageIds : undefined,
      filter,
    });

    const filteredEntityId = await qb.andWhere('e.id = :entityId', { entityId }).getRawOne<{ id: number }>();
    return filteredEntityId?.id
      ? (await this.createListItems({ accountId, user, entityIds: [filteredEntityId.id] }))[0]
      : null;
  }

  async createListItems({ accountId, user, entityIds }: { accountId: number; user: User; entityIds: number[] }) {
    const entities = await this.entityService.getByIdsOrdered({ accountId, entityIds });

    const items = await Promise.all(
      entities.map(async (entity, idx) => {
        const fieldValues = await this.fieldValueService.findMany({ accountId, entityId: entity.id });
        const values = fieldValues.map((value) => value.toDto());
        const userRights = await this.authService.getUserRights({ user, authorizable: entity });
        return { idx, item: EntityListItem.create(entity, values, userRights) };
      }),
    );

    return items.sort((a, b) => a.idx - b.idx).map((i) => i.item);
  }

  async getEntityListMeta({
    accountId,
    user,
    entityTypeId,
    boardId,
    filter,
  }: {
    accountId: number;
    user: User;
    entityTypeId: number;
    boardId: number | null;
    filter: EntityBoardCardFilter;
  }): Promise<EntityListMeta> {
    const stageIds = await this.getStageIds({
      accountId,
      boardId,
      includeStageIds: filter.includeStageIds,
      excludeStageIds: filter.excludeStageIds,
    });
    const hasPrice = await this.fieldService.hasPriceField({ accountId, entityTypeId });
    if (boardId && stageIds?.length === 0) {
      return { totalCount: 0, hasPrice, totalPrice: hasPrice ? 0 : null };
    }

    const qb = await this.createFilteredQb({
      accountId,
      user,
      entityTypeId,
      stageIds: boardId ? stageIds : undefined,
      filter,
    });

    const totalCount = await qb.getCount();
    const totalPrice = hasPrice ? await this.getTotalPrice(qb) : null;

    return { totalCount, hasPrice, totalPrice };
  }

  async batchUpdate({
    accountId,
    user,
    entityTypeId,
    boardId,
    dto,
  }: {
    accountId: number;
    user: User;
    entityTypeId: number;
    boardId: number | null;
    dto: UpdateEntitiesBatchFilterDto;
  }): Promise<number> {
    if (dto.entityIds) {
      return this.entityService.batchUpdateEntityIds(accountId, user, dto.entityIds, dto, UserNotification.Suppressed);
    }

    const stageIds = await this.getStageIds({
      accountId,
      boardId,
      includeStageIds: dto.includeStageIds,
      excludeStageIds: dto.excludeStageIds,
    });
    if (boardId && stageIds?.length === 0) {
      return 0;
    }

    const qb = await this.createFilteredQb({
      accountId,
      user,
      entityTypeId,
      stageIds: boardId ? stageIds : undefined,
      filter: dto,
    });
    qb.orderBy('e.id', 'ASC');

    let updated = 0;
    let offset = 0;
    let entityIds: number[] = [];
    let baseCount = await qb.getCount();
    do {
      const count = await qb.getCount();
      if (count !== baseCount) {
        baseCount = count;
        offset = 0;
      }
      entityIds = (await qb.clone().offset(offset).limit(EntityBatchLimit).getRawMany<{ id: number }>()).map(
        (e) => e.id,
      );
      if (entityIds.length > 0) {
        const pageUpdated = await this.entityService.batchUpdateEntityIds(
          accountId,
          user,
          entityIds,
          dto,
          UserNotification.Suppressed,
        );
        updated += pageUpdated;
        offset += entityIds.length;
      }
    } while (entityIds.length > 0);

    return updated;
  }

  async batchDelete({
    accountId,
    user,
    entityTypeId,
    boardId,
    dto,
  }: {
    accountId: number;
    user: User;
    entityTypeId: number;
    boardId: number | null;
    dto: DeleteEntitiesBatchFilterDto;
  }): Promise<number> {
    if (dto.entityIds) {
      return this.entityService.deleteMany(accountId, user, dto.entityIds, UserNotification.Suppressed);
    }

    const stageIds = await this.getStageIds({
      accountId,
      boardId,
      includeStageIds: dto.includeStageIds,
      excludeStageIds: dto.excludeStageIds,
    });
    if (boardId && stageIds?.length === 0) {
      return 0;
    }

    const qb = await this.createFilteredQb({
      accountId,
      user,
      entityTypeId,
      stageIds: boardId ? stageIds : undefined,
      filter: dto,
    });
    qb.orderBy('e.id', 'ASC');

    let deleted = 0;
    let offset = 0;
    let entityIds: number[] = [];
    do {
      entityIds = (await qb.clone().offset(offset).limit(EntityBatchLimit).getRawMany<{ id: number }>()).map(
        (e) => e.id,
      );
      if (entityIds.length > 0) {
        const pageDeleted = await this.entityService.deleteMany(
          accountId,
          user,
          entityIds,
          UserNotification.Suppressed,
        );
        deleted += pageDeleted;
        offset += entityIds.length - pageDeleted;
      }
    } while (entityIds.length > 0);

    return deleted;
  }

  private async getStageIds({
    accountId,
    boardId,
    includeStageIds,
    excludeStageIds,
  }: {
    accountId: number;
    boardId: number | null | undefined;
    includeStageIds: number[] | null | undefined;
    excludeStageIds: number[] | null | undefined;
  }): Promise<number[] | undefined> {
    const stageIds = includeStageIds?.length
      ? includeStageIds
      : boardId
        ? await this.stageService.findManyIds({ accountId, boardId })
        : [];

    return excludeStageIds?.length ? stageIds.filter((id) => !excludeStageIds.includes(id)) : stageIds;
  }

  private async createFilteredQb({
    accountId,
    user,
    entityTypeId,
    stageIds,
    filter,
    sorting,
  }: {
    accountId: number;
    user: User;
    entityTypeId: number;
    stageIds?: number[];
    filter: EntityBoardCardFilter;
    sorting?: EntitySorting;
  }) {
    const responsibles = await this.authService.whoCanView({
      user,
      authorizable: EntityType.getAuthorizable(entityTypeId),
    });

    const fieldIds = filter.fields?.map((f) => f.fieldId);
    const fields = fieldIds?.length
      ? await this.fieldService.findMany({ accountId, entityTypeId, id: fieldIds })
      : undefined;

    return this.createQb({
      accountId,
      userId: user.id,
      responsibles,
      entityTypeId,
      stageId: stageIds,
      name: filter.search,
      createdAt: filter.createdAt ? DatePeriod.fromFilter(filter.createdAt) : undefined,
      closedAt: filter.closedAt ? DatePeriod.fromFilter(filter.closedAt) : undefined,
      ownerIds: filter.ownerIds,
      tasks: filter.tasks,
      fieldFilters: filter.fields,
      fields,
      sorting,
    });
  }

  private createQb({
    accountId,
    userId,
    responsibles,
    entityTypeId,
    stageId,
    name,
    createdAt,
    closedAt,
    ownerIds,
    tasks,
    fieldFilters,
    fields,
    sorting,
  }: {
    accountId: number;
    userId: number;
    responsibles: number[];
    entityTypeId: number;
    stageId?: number | number[];
    name?: string | null;
    createdAt?: DatePeriod;
    closedAt?: DatePeriod;
    ownerIds?: number[];
    tasks?: EntityTaskFilter;
    fieldFilters?: EntityFieldFilter[];
    fields?: Field[];
    sorting?: EntitySorting;
  }) {
    const qb = this.repository
      .createQueryBuilder('e')
      .select('e.id', 'id')
      .where('e.account_id = :accountId', { accountId })
      .andWhere('e.entity_type_id = :entityTypeId', { entityTypeId });

    if (stageId) {
      if (Array.isArray(stageId)) {
        qb.andWhere('e.stage_id IN (:...stageId)', { stageId });
      } else {
        qb.andWhere('e.stage_id = :stageId', { stageId });
      }
    }

    if (name) {
      qb.andWhere('e.name ILIKE :name', { name: `%${name}%` });
    }

    if (createdAt) {
      if (createdAt.from) {
        qb.andWhere('e.created_at >= :createdAtFrom', { createdAtFrom: createdAt.from });
      }
      if (createdAt.to) {
        qb.andWhere('e.created_at <= :createdAtTo', { createdAtTo: createdAt.to });
      }
    }
    if (closedAt) {
      if (closedAt.from) {
        qb.andWhere('e.closed_at >= :closedAtFrom', { closedAtFrom: closedAt.from });
      }
      if (closedAt.to) {
        qb.andWhere('e.closed_at <= :closedAtTo', { closedAtTo: closedAt.to });
      }
    }

    const users = intersection(ownerIds, responsibles);
    if (users) {
      qb.andWhere(
        new Brackets((qb1) => {
          if (users.length > 0) {
            qb1.where('e.responsible_user_id in (:...responsibles)', { responsibles: users });
          } else {
            qb1.where('e.responsible_user_id IS NULL');
          }
          if (!ownerIds) {
            qb1.orWhere(`e.created_by = ${userId}`).orWhere(`e.participant_ids @> '${userId}'`);
          }
        }),
      );
    }

    if (tasks) {
      const taskQb = this.dataSource
        .createQueryBuilder()
        .select('at.id')
        .from('all_tasks', 'at')
        .where('at.entity_id = e.id')
        .andWhere('at.is_resolved = FALSE');
      if (tasks === EntityTaskFilter.WithoutTask) {
        qb.andWhere(`NOT EXISTS (${taskQb.getQuery()})`);
      } else if (tasks === EntityTaskFilter.WithTask) {
        qb.andWhere(`EXISTS (${taskQb.getQuery()})`);
      } else if (tasks === EntityTaskFilter.OverdueTask) {
        taskQb.andWhere('at.end_date < NOW()');
        qb.andWhere(`EXISTS (${taskQb.getQuery()})`);
      } else if (tasks === EntityTaskFilter.TodayTask) {
        taskQb.andWhere(
          new Brackets((todayQb) => {
            todayQb
              .where('at.start_date < NOW() AND at.end_date > NOW()')
              .orWhere('at.start_date IS NOT NULL AND at.end_date IS NULL AND at.start_date < NOW()')
              .orWhere('at.start_date IS NULL AND at.end_date IS NOT NULL AND at.end_date > NOW()');
          }),
        );
        qb.andWhere(`EXISTS (${taskQb.getQuery()})`);
      }
    }

    if (fieldFilters && fields) {
      this.addBoardFieldsCondition({ qb, fieldFilters, fields });
    }

    if (sorting) {
      switch (sorting) {
        case EntitySorting.Manual:
          qb.addSelect('e.weight', 'weight').orderBy('e.weight', 'ASC');
          break;
        case EntitySorting.CreatedAsc:
          qb.addSelect('e.created_at', 'created_at').orderBy('e.created_at', 'ASC');
          break;
        case EntitySorting.CreatedDesc:
          qb.addSelect('e.created_at', 'created_at').orderBy('e.created_at', 'DESC');
          break;
        case EntitySorting.NameAsc:
          qb.addSelect('e.name', 'name').orderBy('e.name', 'ASC');
          break;
        case EntitySorting.NameDesc:
          qb.addSelect('e.name', 'name').orderBy('e.name', 'DESC');
          break;
      }
    }
    qb.addOrderBy('e.id', 'DESC');

    return qb;
  }

  private addBoardFieldsCondition({
    qb,
    fieldFilters,
    fields,
  }: {
    qb: SelectQueryBuilder<Entity>;
    fieldFilters: EntityFieldFilter[];
    fields: Field[];
  }) {
    for (const fieldFilter of fieldFilters) {
      const field = fields.find((f) => f.id === fieldFilter.fieldId);
      if (!field) continue;

      const fieldAlias = `fv_${field.id}`;
      qb.leftJoin(FieldValue, fieldAlias, `${fieldAlias}.entity_id = e.id AND ${fieldAlias}.field_id = ${field.id}`);

      switch (field.type) {
        case FieldType.Text:
        case FieldType.RichText:
        case FieldType.Link:
        case FieldType.Checklist:
          if (fieldFilter.type === SimpleFilterType.String) {
            this.addStringFieldCondition(qb, fieldAlias, 'value', fieldFilter.filter as StringFilter);
          }
          break;
        case FieldType.MultiText:
        case FieldType.Email:
        case FieldType.Phone:
          if (fieldFilter.type === SimpleFilterType.String) {
            this.addStringFieldCondition(qb, fieldAlias, 'values', fieldFilter.filter as StringFilter);
          }
          break;
        case FieldType.Number:
        case FieldType.Value:
        case FieldType.Formula:
          if (fieldFilter.type === SimpleFilterType.Number) {
            this.addNumberFieldCondition(qb, fieldAlias, fieldFilter.filter as NumberFilter);
          }
          break;
        case FieldType.Date:
          if (fieldFilter.type === SimpleFilterType.Date) {
            this.addDateFieldCondition(qb, fieldAlias, fieldFilter.filter as DateFilter);
          }
          break;
        case FieldType.Switch:
          if (fieldFilter.type === SimpleFilterType.Boolean) {
            this.addBooleanFieldCondition(qb, fieldAlias, fieldFilter.filter as BooleanFilter);
          }
          break;
        case FieldType.Select:
        case FieldType.ColoredSelect:
          if (fieldFilter.type === SimpleFilterType.Select) {
            this.addSelectFieldCondition(qb, fieldAlias, 'optionId', fieldFilter.filter as SelectFilter);
          }
          break;
        case FieldType.MultiSelect:
        case FieldType.ColoredMultiSelect:
        case FieldType.CheckedMultiSelect:
          if (fieldFilter.type === SimpleFilterType.Select) {
            this.addMultiSelectFieldCondition(qb, fieldAlias, 'optionIds', fieldFilter.filter as SelectFilter);
          }
          break;
        case FieldType.Participant:
          if (fieldFilter.type === SimpleFilterType.Select) {
            this.addSelectFieldCondition(qb, fieldAlias, 'value', fieldFilter.filter as SelectFilter);
          }
          break;
        case FieldType.Participants:
          if (fieldFilter.type === SimpleFilterType.Select) {
            this.addMultiSelectFieldCondition(qb, fieldAlias, 'userIds', fieldFilter.filter as SelectFilter);
          }
          break;
        case FieldType.File:
          if (fieldFilter.type === SimpleFilterType.Exists) {
            this.addExistsFieldCondition(qb, fieldAlias, 'value', fieldFilter.filter as ExistsFilter);
          }
          break;
      }
    }
  }
  private addExistsFieldCondition<T>(
    qb: SelectQueryBuilder<T>,
    fieldAlias: string,
    valueAlias: string,
    filter: ExistsFilter,
  ) {
    switch (filter.type) {
      case ExistsFilterType.Empty:
        qb.andWhere(
          new Brackets((qb1) =>
            qb1.where(`${fieldAlias}.payload is null`).orWhere(`${fieldAlias}.payload->>'${valueAlias}' = ''`),
          ),
        );
        break;
      case ExistsFilterType.NotEmpty:
        qb.andWhere(`${fieldAlias}.payload->>'${valueAlias}' != ''`);
        break;
    }
  }
  private addStringFieldCondition<T>(
    qb: SelectQueryBuilder<T>,
    fieldAlias: string,
    valueAlias: string,
    filter: StringFilter,
  ) {
    switch (filter.type) {
      case StringFilterType.Empty:
        qb.andWhere(
          new Brackets((qb1) =>
            qb1.where(`${fieldAlias}.payload is null`).orWhere(`${fieldAlias}.payload->>'${valueAlias}' = ''`),
          ),
        );
        break;
      case StringFilterType.NotEmpty:
        qb.andWhere(`${fieldAlias}.payload->>'${valueAlias}' != ''`);
        break;
      default:
        if (filter.text) {
          qb.andWhere(`${fieldAlias}.payload->>'${valueAlias}' ilike :${fieldAlias}_value`, {
            [`${fieldAlias}_value`]: `%${filter.text}%`,
          });
        }
    }
  }
  private addNumberFieldCondition<T>(qb: SelectQueryBuilder<T>, fieldAlias: string, filter: NumberFilter) {
    if (filter.min && !isNaN(Number(filter.min))) {
      qb.andWhere(`(${fieldAlias}.payload->>'value')::numeric >= :${fieldAlias}_from`, {
        [`${fieldAlias}_from`]: filter.min,
      });
    }
    if (filter.max && !isNaN(Number(filter.max))) {
      qb.andWhere(`(${fieldAlias}.payload->>'value')::numeric <= :${fieldAlias}_to`, {
        [`${fieldAlias}_to`]: filter.max,
      });
    }
  }
  private addDateFieldCondition<T>(qb: SelectQueryBuilder<T>, fieldAlias: string, filter: DateFilter) {
    if (filter.from) {
      const fromDate = DateUtil.fromISOString(filter.from);
      qb.andWhere(`(${fieldAlias}.payload->>'value')::timestamp >= '${fromDate.toISOString()}'::timestamp`);
    }
    if (filter.to) {
      const toDate = DateUtil.fromISOString(filter.to);
      qb.andWhere(`(${fieldAlias}.payload->>'value')::timestamp <= '${toDate.toISOString()}'::timestamp`);
    }
  }
  private addBooleanFieldCondition<T>(qb: SelectQueryBuilder<T>, fieldAlias: string, filter: BooleanFilter) {
    if (filter.value !== undefined && filter.value !== null) {
      if (filter.value) {
        qb.andWhere(`(${fieldAlias}.payload->>'value')::boolean = true`);
      } else {
        qb.andWhere(
          new Brackets((qb1) =>
            qb1.where(`${fieldAlias}.payload is null`).orWhere(`(${fieldAlias}.payload->>'value')::boolean = false`),
          ),
        );
      }
    }
  }
  private addSelectFieldCondition<T>(
    qb: SelectQueryBuilder<T>,
    fieldAlias: string,
    valueAlias: string,
    filter: SelectFilter,
  ) {
    if (filter.optionIds?.length) {
      qb.andWhere(`COALESCE((${fieldAlias}.payload->>'${valueAlias}')::integer, 0) IN (:...${fieldAlias}_value)`, {
        [`${fieldAlias}_value`]: filter.optionIds,
      });
    }
  }
  private addMultiSelectFieldCondition<T>(
    qb: SelectQueryBuilder<T>,
    fieldAlias: string,
    valueAlias: string,
    filter: SelectFilter,
  ) {
    if (filter.optionIds?.length > 0) {
      qb.leftJoin(
        '(select 1)',
        `dummy_${fieldAlias}`,
        `true cross join jsonb_array_elements(${fieldAlias}.payload->'${valueAlias}') a(opt_id_${fieldAlias})`,
      );
      qb.andWhere(`opt_id_${fieldAlias}::text::integer IN (:...${fieldAlias}_value)`, {
        [`${fieldAlias}_value`]: filter.optionIds,
      });
    }
  }

  private async getTotalPrice(qb: SelectQueryBuilder<Entity>): Promise<number> {
    const { sum } = await this.dataSource
      .createQueryBuilder()
      .select(`sum(cast(fv.payload::jsonb->>'value' as decimal))::decimal`, 'sum')
      .from('field_value', 'fv')
      .where(`fv.field_type = '${FieldType.Value}'`)
      .andWhere(`fv.entity_id in (${qb.getQuery()})`)
      .setParameters(qb.getParameters())
      .getRawOne<{ sum: number }>();

    return sum ? Number(sum) : 0;
  }
}
