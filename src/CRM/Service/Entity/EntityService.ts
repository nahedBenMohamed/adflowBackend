import { ForbiddenException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import {
  DateUtil,
  FileLinkSource,
  ManualSorting,
  NotFoundError,
  ObjectState,
  PagingQuery,
  UserNotification,
} from '@/common';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { ChatService } from '@/modules/multichat/chat/services/chat.service';
import { ShipmentService } from '@/modules/inventory/shipment/shipment.service';
import { FieldType } from '@/modules/entity/entity-field/common/enums/field-type.enum';
import { FieldAccess } from '@/modules/entity/entity-field/field-settings/enums/field-access.enum';
import { UpdateFieldValueDto } from '@/modules/entity/entity-field/field-value/dto/update-field-value.dto';
import { FieldSettingsService } from '@/modules/entity/entity-field/field-settings/field-settings.service';
import { FieldValue } from '@/modules/entity/entity-field/field-value/entities/field-value.entity';
import { FieldValueService } from '@/modules/entity/entity-field/field-value/field-value.service';
import { FieldService } from '@/modules/entity/entity-field/field/field.service';
import { EntityInfoDto, EntityInfoService } from '@/modules/entity/entity-info';

import { EntityCategory } from '../../common';
import { BoardService } from '../../board/board.service';
import { BoardStage, BoardStageService } from '../../board-stage';
import { EntityLink } from '../../entity-link/entities';
import { EntityLinkService } from '../../entity-link/entity-link.service';
import { EntityTypeService } from '../../entity-type/entity-type.service';
import { EntitySearchService } from '../../entity-search/entity-search.service';

import { Entity } from '../../Model/Entity/Entity';
import { ExternalEntityService } from '../ExternalEntity/ExternalEntityService';
import { FileLinkService } from '../FileLink/FileLinkService';

import { EntityServiceEmitter } from './entity-service.emitter';
import { ReadonlyFieldChangedError } from './errors/readonly-field-changed.error';
import { RequiredFieldEmptyError } from './errors/required-field-empty.error';
import { FileLinkDto } from '../FileLink/FileLinkDto';
import { EntityDto } from './Dto/EntityDto';
import { CreateEntityDto } from './Dto/CreateEntityDto';
import { UpdateEntityDto } from './Dto/UpdateEntityDto';
import { CreateSimpleEntityDto } from './Dto/CreateSimpleEntityDto';

const Weight = {
  min: 100.0,
  step: 100.0,
};
const BatchProcessLimit = 100;

interface CreateSimpleOptions {
  linkedEntities?: number[];
  createdAt?: Date;
  userNotification?: UserNotification;
  checkActiveLead?: boolean;
  checkActiveLeadContactEntityId?: number;
  checkDuplicate?: boolean;
}
type EntityWithOrder = Record<number, { entity: Entity; order: number }>;

interface FindFilter {
  entityId?: number | number[];
  entityTypeId?: number | number[];
  boardId?: number | number[];
  stageId?: number | number[];
  fieldValue?: { type: FieldType; value: string };
  exclude?: { entityId?: number | number[]; entityTypeId?: number | number[] };
}
interface CalculateEntity {
  entityTypeId: number;
  entityId: number;
  recalculate?: boolean;
  children?: CalculateEntity[];
}

//TODO: need to refactor all class
@Injectable()
export class EntityService {
  constructor(
    @InjectRepository(Entity)
    private readonly repository: Repository<Entity>,
    private readonly authService: AuthorizationService,
    private readonly fieldValueService: FieldValueService,
    private readonly fieldService: FieldService,
    private readonly entityLinkService: EntityLinkService,
    @Inject(forwardRef(() => ExternalEntityService))
    private readonly externalEntityService: ExternalEntityService,
    private readonly entityTypeService: EntityTypeService,
    private readonly fileLinkService: FileLinkService,
    @Inject(forwardRef(() => BoardStageService))
    private readonly stageService: BoardStageService,
    @Inject(forwardRef(() => BoardService))
    private readonly boardService: BoardService,
    private readonly fieldSettingsService: FieldSettingsService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly shipmentService: ShipmentService,
    private readonly entityEmitter: EntityServiceEmitter,
    private readonly entityInfoService: EntityInfoService,
    @Inject(forwardRef(() => EntitySearchService))
    private readonly entitySearchService: EntitySearchService,
  ) {}

  //////////////////
  // Create
  //////////////////
  //TODO: remove this
  /**
   * @deprecated
   */
  async save(entity: Entity): Promise<Entity> {
    return this.repository.save(entity);
  }

  async createAndGetDto(accountId: number, user: User, dto: CreateEntityDto): Promise<EntityDto> {
    const entity = await this.create(accountId, user, dto);

    return this.getDtoForEntity(accountId, user, entity);
  }

  async create(
    accountId: number,
    user: User,
    dto: CreateEntityDto,
    userNotification = UserNotification.Default,
  ): Promise<Entity> {
    const entity = await this.createEntity({
      accountId,
      user,
      data: {
        entityTypeId: dto.entityTypeId,
        name: dto.name,
        boardId: dto.boardId,
        stageId: dto.stageId,
        ownerId: dto.responsibleUserId,
        sorting: dto.sorting,
        focused: dto.focused,
      },
    });

    if (dto.entityLinks) {
      await this.entityLinkService.processMany({ accountId, links: dto.entityLinks });
    }

    if (dto.fieldValues?.length) {
      const { updateParticipants, value } = await this.fieldValueService.processBatch({
        accountId,
        entityId: entity.id,
        dtos: dto.fieldValues,
      });
      await this.postProcessFieldValues(accountId, entity, updateParticipants, value, true);
    }

    this.entityEmitter.emitCreatedEvent(accountId, entity, { userNotification });

    return entity;
  }

  async createSimpleAndGetInfo({
    accountId,
    user,
    dto,
    options,
  }: {
    accountId: number;
    user: User;
    dto: CreateSimpleEntityDto;
    options?: CreateSimpleOptions;
  }): Promise<EntityInfoDto[]> {
    const entities = await this.createSimple({ accountId, user, dto, options });

    return Promise.all(entities.map((entity) => this.entityInfoService.getEntityInfo({ user, entity, access: true })));
  }

  async createSimple({
    accountId,
    user,
    dto,
    options,
  }: {
    accountId: number;
    user: User;
    dto: CreateSimpleEntityDto;
    options?: CreateSimpleOptions;
  }): Promise<Entity[]> {
    let entity = options?.checkDuplicate
      ? await this.findDuplicateEntity({
          accountId,
          user,
          dto,
          checkActive: options?.checkActiveLead,
          checkActiveLeadContactEntityId: options?.checkActiveLeadContactEntityId,
        })
      : null;
    const entityExists = !!entity;

    let checkActiveLeadContactEntityId: number | undefined = undefined;
    if (entityExists && options?.checkActiveLead) {
      const entityType = await this.entityTypeService.findOne(accountId, { id: entity.entityTypeId });
      if (entityType.entityCategory === EntityCategory.CONTACT) {
        checkActiveLeadContactEntityId = entity.id;
      }
    }

    if (!entityExists) {
      entity = await this.createEntity({
        accountId,
        user,
        data: {
          entityTypeId: dto.entityTypeId,
          name: dto.name,
          boardId: dto.boardId,
          stageId: dto.stageId,
          createdAt: options?.createdAt,
          ownerId: dto.ownerId,
          focused: dto.focused,
        },
      });
    }

    if (options?.linkedEntities?.length) {
      await Promise.all(
        options.linkedEntities.map((targetId) =>
          this.entityLinkService.create({ accountId, sourceId: entity.id, targetId }),
        ),
      );
    }
    if (dto.linkedEntities?.length) {
      await Promise.all(
        dto.linkedEntities
          .filter((linkedEntity): linkedEntity is number => typeof linkedEntity === 'number')
          .map((targetId) => this.entityLinkService.create({ accountId, sourceId: entity.id, targetId })),
      );
    }

    if (dto.fieldValues?.length) {
      const { updateParticipants, value } = await this.fieldValueService.createManySimple({
        accountId,
        entityTypeId: entity.entityTypeId,
        entityId: entity.id,
        dtos: dto.fieldValues,
      });
      await this.postProcessFieldValues(accountId, entity, updateParticipants, value, true);
    }

    const entities = [entity];
    if (dto.linkedEntities?.length) {
      entities.push(
        ...(
          await Promise.all(
            dto.linkedEntities
              .filter((linkedEntity): linkedEntity is CreateSimpleEntityDto => typeof linkedEntity !== 'number')
              .map((dto) =>
                this.createSimple({
                  accountId,
                  user,
                  dto,
                  options: { ...options, linkedEntities: [entity.id], checkActiveLeadContactEntityId },
                }),
              ),
          )
        ).flat(),
      );
    }

    if (!entityExists) {
      this.entityEmitter.emitCreatedEvent(accountId, entity, { userNotification: options?.userNotification });
    }

    return entities;
  }

  private async createEntity({
    accountId,
    user,
    data,
  }: {
    accountId: number;
    user: User;
    data: {
      entityTypeId: number;
      name?: string | null;
      boardId?: number | null;
      stageId?: number | null;
      createdAt?: Date | null;
      ownerId?: number | null;
      sorting?: ManualSorting | null;
      focused?: boolean | null;
    };
  }): Promise<Entity> {
    const entityType = await this.entityTypeService.findOne(accountId, { id: data.entityTypeId });
    await this.authService.check({ action: 'create', user, authorizable: entityType, throwError: true });

    const name =
      data.name && data.name.trim() !== ''
        ? data.name
        : `${entityType.name} ${Math.trunc(new Date().getTime() / 1000)}`;

    const stage = await this.findStage({
      accountId,
      entityTypeId: data.entityTypeId,
      boardId: data.boardId,
      stageId: data.stageId,
    });

    const weight = await this.calculateWeight({
      accountId,
      entityTypeId: entityType.id,
      boardId: stage?.boardId,
      afterId: data.sorting?.afterId,
      beforeId: data.sorting?.beforeId,
    });
    return this.repository.save(
      new Entity(
        accountId,
        name,
        entityType.id,
        data.ownerId ?? user.id,
        stage?.boardId ?? null,
        stage?.id ?? null,
        user.id,
        weight,
        data.focused ?? false,
        this.getClosedAt(null, stage),
        null,
        data.createdAt,
        null,
        null,
        null,
      ),
    );
  }

  private async findDuplicateEntity({
    accountId,
    user,
    dto,
    checkActive,
    checkActiveLeadContactEntityId,
  }: {
    accountId: number;
    user: User;
    dto: CreateSimpleEntityDto;
    checkActive?: boolean | null;
    checkActiveLeadContactEntityId?: number | null;
  }): Promise<Entity | null> {
    const findByField = async ({
      accountId,
      user,
      dto,
      fieldType,
      checkActive,
    }: {
      accountId: number;
      user: User;
      dto: CreateSimpleEntityDto;
      fieldType: FieldType;
      checkActive?: boolean | null;
    }): Promise<Entity | null> => {
      const fieldValue = dto.fieldValues.find((fv) => fv.fieldType === fieldType);
      if (fieldValue) {
        const { entities } = await this.entitySearchService.search({
          accountId,
          user,
          filter: { entityTypeId: dto.entityTypeId, fieldType, fieldValue: fieldValue.value as string },
          paging: new PagingQuery(0, checkActive ? 20 : 1),
        });
        if (entities.length) {
          return checkActive ? entities.find((e) => !e.closedAt) : entities[0];
        }
      }
      return null;
    };

    let entity = await findByField({ accountId, user, dto, fieldType: FieldType.Phone, checkActive });
    if (!entity) entity = await findByField({ accountId, user, dto, fieldType: FieldType.Email, checkActive });

    if (!entity && checkActiveLeadContactEntityId) {
      const linked = await this.findLinkedEntities({ accountId, entityId: checkActiveLeadContactEntityId });
      entity = linked
        .filter((l) => l.entityTypeId === dto.entityTypeId)
        .sort((a, b) => DateUtil.sort(b.createdAt, a.createdAt))
        .find((e) => !e.closedAt);
    }

    return entity;
  }

  async copyToStage(
    accountId: number,
    entityId: number,
    stageId: number,
    copyOriginal: boolean,
  ): Promise<Entity | null> {
    const sourceEntity = await this.findOne(accountId, { entityId });
    const stage = await this.stageService.findOne({ accountId, stageId });

    if (sourceEntity && stage) {
      let copiedEntity = sourceEntity.copy();
      if (!copyOriginal) {
        copiedEntity.update({
          stageId: stage.id,
          boardId: stage.boardId,
          closedAt: this.getClosedAt(sourceEntity.closedAt, stage),
        });
      }
      copiedEntity = await this.repository.save(copiedEntity);
      await this.entityLinkService.copyEntityLinks({
        accountId,
        sourceId: sourceEntity.id,
        targetId: copiedEntity.id,
      });
      await this.fieldValueService.copyEntityFieldValues({
        accountId,
        sourceEntityId: sourceEntity.id,
        targetEntityId: copiedEntity.id,
      });
      this.entityEmitter.emitCreatedEvent(accountId, copiedEntity, {
        copiedFrom: copyOriginal ? sourceEntity.id : undefined,
      });

      if (copyOriginal) {
        sourceEntity.update({
          stageId: stage.id,
          boardId: stage.boardId,
          closedAt: this.getClosedAt(sourceEntity.closedAt, stage),
        });
        this.repository.save(sourceEntity);
        this.entityEmitter.emitUpdatedEvent(accountId, sourceEntity);
        this.entityEmitter.emitStageChangedEvent(accountId, sourceEntity);
      }

      return copiedEntity;
    }
    return null;
  }

  private async findStage({
    accountId,
    entityTypeId,
    boardId,
    stageId,
  }: {
    accountId: number;
    entityTypeId: number;
    boardId?: number | null;
    stageId?: number | null;
  }) {
    const stage =
      stageId || boardId
        ? await this.stageService.findOne({ accountId, boardId: boardId ?? undefined, stageId: stageId ?? undefined })
        : null;
    if (stage) return stage;

    const board = await this.boardService.findOneId({ accountId, recordId: entityTypeId });
    return board ? this.stageService.findOne({ accountId, boardId: board }) : null;
  }
  //////////////////

  //////////////////
  // Get
  //////////////////
  async findOne(accountId: number, filter?: FindFilter): Promise<Entity> {
    return this.createFindQb(accountId, filter).getOne();
  }

  async findMany(accountId: number, filter?: FindFilter, paging?: PagingQuery): Promise<Entity[]> {
    return this.createFindQb(accountId, filter).skip(paging?.skip).take(paging?.take).orderBy('e.id').getMany();
  }

  async getByIdsOrdered({ accountId, entityIds }: { accountId: number; entityIds: number[] }): Promise<Entity[]> {
    const entities = await this.createFindQb(accountId, { entityId: entityIds }).getMany();

    const entityMap = new Map<number, Entity>(entities.map((entity) => [entity.id, entity]));
    return entityIds.map((id) => entityMap.get(id)).filter(Boolean);
  }

  async ensureExistId(accountId: number, id: number): Promise<number | null> {
    const entity = await this.repository.findOneBy({ accountId, id });
    return entity ? id : null;
  }

  async getDtoByIdForUI(accountId: number, user: User, entityId: number, checkPermission = true): Promise<EntityDto> {
    const entity = await this.findOne(accountId, { entityId });
    if (!entity) {
      throw NotFoundError.withId(Entity, entityId);
    }

    return this.getDtoForEntity(accountId, user, entity, checkPermission);
  }

  async getDtoForEntity(accountId: number, user: User, entity: Entity, checkPermission = true): Promise<EntityDto> {
    if (checkPermission) {
      await this.authService.check({ action: 'view', user, authorizable: entity, throwError: true });
    }

    const allFieldValues = await this.fieldValueService.findMany({ accountId, entityId: entity.id });
    const fieldValues = await this.excludeHiddenFields(accountId, user.id, entity, allFieldValues);
    const entityLinks = await this.entityLinkService.findMany({ accountId, sourceId: entity.id });
    const allowedLinks: EntityLink[] = [];
    for (const link of entityLinks) {
      const linkedEntity = await this.repository.findOneBy({ id: link.targetId });
      if (await this.authService.check({ action: 'view', user, authorizable: linkedEntity })) {
        allowedLinks.push(link);
      }
    }
    const externalEntities = await this.externalEntityService.getExternalEntitiesWithType(entity.id);
    const userRights = await this.authService.getUserRights({ user, authorizable: entity });
    const chats = await this.chatService.findMany({
      accountId,
      filter: { entityId: entity.id },
      accessUserId: user.id,
    });
    const shipment = await this.shipmentService.findOne({ accountId, user, filter: { entityId: entity.id } });

    return EntityDto.fromEntity(
      entity,
      fieldValues,
      allowedLinks?.map((l) => l.toDto()),
      externalEntities,
      userRights,
      chats.map((chat) => chat.toDto()),
      shipment?.shippedAt?.toISOString() ?? null,
    );
  }

  async getFileLinks(account: Account, entityId: number): Promise<FileLinkDto[]> {
    return this.fileLinkService.getFileLinkDtos(account, FileLinkSource.ENTITY, entityId);
  }

  async getDocumentLinks(account: Account, entityId: number): Promise<FileLinkDto[]> {
    return this.fileLinkService.getFileLinkDtos(account, FileLinkSource.ENTITY_DOCUMENT, entityId, 'DESC');
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder('e').where('e.account_id = :accountId', { accountId });

    if (filter?.entityId) {
      if (Array.isArray(filter.entityId)) {
        qb.andWhere('e.id IN (:...entityIds)', { entityIds: filter.entityId });
      } else {
        qb.andWhere('e.id = :entityId', { entityId: filter.entityId });
      }
    }
    if (filter?.entityTypeId) {
      if (Array.isArray(filter.entityTypeId)) {
        qb.andWhere('e.entity_type_id IN (:...entityTypeIds)', { entityTypeIds: filter.entityTypeId });
      } else {
        qb.andWhere('e.entity_type_id = :entityTypeId', { entityTypeId: filter.entityTypeId });
      }
    }
    if (filter?.exclude?.entityId) {
      if (Array.isArray(filter.exclude.entityId)) {
        if (filter.exclude.entityId.length) {
          qb.andWhere('e.id NOT IN (:...exEntityIds)', { exEntityIds: filter.exclude.entityId });
        }
      } else {
        qb.andWhere('e.id != :exEntityId', { exEntityId: filter.exclude.entityId });
      }
    }
    if (filter?.exclude?.entityTypeId) {
      if (Array.isArray(filter.exclude.entityTypeId)) {
        if (filter.exclude.entityTypeId.length) {
          qb.andWhere('e.entity_type_id NOT IN (:...exEntityTypeIds)', {
            exEntityTypeIds: filter.exclude.entityTypeId,
          });
        }
      } else {
        qb.andWhere('e.entity_type_id != :exEntityTypeId', { exEntityTypeId: filter.exclude.entityTypeId });
      }
    }
    if (filter?.boardId) {
      if (Array.isArray(filter.boardId)) {
        qb.andWhere('e.board_id IN (:...boardIds)', { boardIds: filter.boardId });
      } else {
        qb.andWhere('e.board_id = :boardId', { boardId: filter.boardId });
      }
    }
    if (filter?.stageId) {
      if (Array.isArray(filter.stageId)) {
        qb.andWhere('e.stage_id IN (:...stageIds)', { stageIds: filter.stageId });
      } else {
        qb.andWhere('e.stage_id = :stageId', { stageId: filter.stageId });
      }
    }
    if (filter?.fieldValue) {
      qb.leftJoin('field_value', 'fv', 'fv.entity_id = e.id AND fv.field_type = :fieldType', {
        fieldType: filter.fieldValue.type,
      }).andWhere(`(fv.payload::jsonb::text ilike :fieldValue)`, { fieldValue: `%${filter.fieldValue.value}%` });
    }

    return qb;
  }
  //////////////////

  //////////////////
  // Update
  //////////////////
  async updateAndGetDto(accountId: number, user: User, id: number, dto: UpdateEntityDto): Promise<EntityDto> {
    const entity = await this.update(accountId, user, id, dto);

    return this.getDtoForEntity(accountId, user, entity);
  }

  async update(
    accountId: number,
    user: User | null,
    entityId: number,
    dto: UpdateEntityDto,
    {
      userNotification = UserNotification.Default,
      skipCheckRestrictions = false,
      skipCheckPermissions = false,
    }: {
      userNotification?: UserNotification;
      skipCheckRestrictions?: boolean;
      skipCheckPermissions?: boolean;
    } = {},
  ): Promise<Entity> {
    const entity = await this.repository.findOneBy({ accountId, id: entityId });
    if (!entity) {
      throw NotFoundError.withId(Entity, entityId);
    }

    if (!skipCheckPermissions && user) {
      await this.authService.check({ action: 'edit', user, authorizable: entity, throwError: true });
    }

    const ownerChanged = dto.responsibleUserId && entity.responsibleUserId !== dto.responsibleUserId;
    const stageChanged = dto.stageId && entity.stageId !== dto.stageId;
    const stage = entity.stageId
      ? await this.stageService.findOne({ accountId, stageId: dto.stageId ?? entity.stageId })
      : null;
    if (entity.stageId && !stage) {
      throw NotFoundError.withId(BoardStage, dto.stageId ?? entity.stageId);
    }

    if (!skipCheckRestrictions && stageChanged && user) {
      await this.checkFieldsRestriction(accountId, user.id, entity, stage.id, dto);
    }

    dto.closedAt = this.getClosedAt(entity.closedAt, stage);
    if (stage && !dto.boardId) dto.boardId = stage.boardId;
    entity.update(dto);
    if (dto.sorting) {
      entity.weight = await this.calculateWeight({
        accountId,
        entityTypeId: entity.entityTypeId,
        boardId: stage ? stage.boardId : null,
        afterId: dto.sorting.afterId,
        beforeId: dto.sorting.beforeId,
      });
    }
    await this.repository.save(entity);

    let linksChanged = false;
    if (dto.entityLinks) {
      linksChanged = await this.entityLinkService.processMany({ accountId, links: dto.entityLinks });
    }
    if (dto.fieldValues?.length) {
      const { recalculate, updateParticipants, value } = await this.fieldValueService.processBatch({
        accountId,
        entityId: entity.id,
        dtos: dto.fieldValues,
      });
      await this.postProcessFieldValues(accountId, entity, updateParticipants, value, recalculate || linksChanged);
    } else if (linksChanged) {
      await this.calculateFormulas(accountId, entity);
    }

    this.entityEmitter.emitUpdatedEvent(accountId, entity, { userNotification });
    if (stageChanged) {
      this.entityEmitter.emitStageChangedEvent(accountId, entity, { userNotification });
    }
    if (ownerChanged && user) {
      this.entityEmitter.emitOwnerChangedEvent(accountId, user.id, entity, { userNotification });
    }

    return entity;
  }

  async updateFieldValue(
    accountId: number,
    user: User,
    entityId: number,
    fieldId: number,
    dto: UpdateFieldValueDto,
  ): Promise<void> {
    dto.fieldId = dto.fieldId || fieldId;
    await this.update(accountId, user, entityId, { fieldValues: [dto] });
  }

  async updateValue(accountId: number, entityId: number, price: number): Promise<void> {
    const entity = await this.findOne(accountId, { entityId });

    if (entity) {
      const field = await this.fieldService.findOne({
        accountId,
        entityTypeId: entity.entityTypeId,
        type: FieldType.Value,
      });

      if (field && !field.value) {
        await this.fieldValueService.setValue({
          accountId,
          entityId,
          fieldId: field.id,
          dto: {
            fieldId: field.id,
            fieldType: field.type,
            payload: { value: price },
          },
        });

        entity.value = price;
        await this.repository.save(entity);

        await this.calculateFormulas(accountId, entity);

        this.entityEmitter.emitUpdatedEvent(accountId, entity);
      }
    }
  }

  async batchUpdateEntityIds(
    accountId: number,
    user: User,
    entityIds: number[],
    {
      responsibleUserId,
      boardId,
      stageId,
      responsibleEntityTypeIds,
    }: { responsibleUserId?: number; boardId?: number; stageId?: number; responsibleEntityTypeIds?: number[] },
    userNotification = UserNotification.Default,
  ): Promise<number> {
    let updated = 0;
    for (const entityId of entityIds) {
      try {
        await this.update(accountId, user, entityId, { responsibleUserId, boardId, stageId }, { userNotification });
        updated++;

        if (responsibleEntityTypeIds?.length) {
          const links = await this.entityLinkService.findMany({ accountId, sourceId: entityId });
          for (const link of links) {
            const linkedEntity = await this.repository.findOneBy({ id: link.targetId });
            if (responsibleEntityTypeIds.includes(linkedEntity.entityTypeId)) {
              await this.update(accountId, user, linkedEntity.id, { responsibleUserId }, { userNotification });
            }
          }
        }
      } catch (e) {
        if (!(e instanceof ForbiddenException)) throw e;
      }
    }
    return updated;
  }

  async removeUser({ accountId, userId, newUserId }: { accountId: number; userId: number; newUserId?: number | null }) {
    if (newUserId) {
      await this.repository.update(
        { accountId, responsibleUserId: userId },
        { responsibleUserId: newUserId, updatedAt: DateUtil.now() },
      );

      await this.repository
        .createQueryBuilder()
        .update()
        .set({
          participantIds: () =>
            // eslint-disable-next-line max-len
            `(SELECT jsonb_agg(DISTINCT CASE WHEN elem::integer = ${userId} THEN ${newUserId} ELSE elem::integer END) FROM jsonb_array_elements(participant_ids) AS elem)`,
        })
        .where('account_id = :accountId', { accountId })
        .andWhere('participant_ids IS NOT NULL')
        .andWhere(`participant_ids @> jsonb_build_array(${userId})`)
        .execute();
    } else {
      await this.repository
        .createQueryBuilder()
        .update()
        .set({
          participantIds: () =>
            // eslint-disable-next-line max-len
            `(SELECT jsonb_agg(elem) FROM jsonb_array_elements(participant_ids) AS elem WHERE elem::integer != ${userId})`,
        })
        .where('account_id = :accountId', { accountId })
        .andWhere('participant_ids IS NOT NULL')
        .andWhere(`participant_ids @> jsonb_build_array(${userId})`)
        .execute();
    }
  }

  async changeStageForAll({
    accountId,
    boardId,
    stageId,
    newStageId,
  }: {
    accountId: number;
    boardId: number;
    stageId: number;
    newStageId: number;
  }) {
    const qb = this.repository
      .createQueryBuilder('entity')
      .select('entity.id', 'id')
      .where('entity.account_id = :accountId', { accountId })
      .andWhere('entity.board_id = :boardId', { boardId })
      .andWhere('entity.stage_id = :stageId', { stageId })
      .limit(BatchProcessLimit);
    let entities: { id: number }[] = [];
    do {
      entities = await qb.getRawMany<{ id: number }>();
      for (const entity of entities) {
        await this.update(
          accountId,
          null,
          entity.id,
          { boardId: boardId, stageId: newStageId },
          { skipCheckRestrictions: true, skipCheckPermissions: true },
        );
      }
    } while (entities.length);
  }
  //////////////////

  //////////////////
  // Delete
  //////////////////
  async delete(accountId: number, user: User, entityId: number, userNotification = UserNotification.Default) {
    const entity = await this.repository.findOneBy({ accountId, id: entityId });
    if (entity) {
      await this.authService.check({ action: 'delete', user, authorizable: entity, throwError: true });

      const links = await this.entityLinkService.findMany({ accountId, sourceId: entityId });

      await this.repository.delete({ accountId, id: entityId });
      this.fileLinkService.processFiles(accountId, FileLinkSource.ENTITY, entityId, []);
      this.fileLinkService.processFiles(accountId, FileLinkSource.ENTITY_DOCUMENT, entityId, []);

      Promise.all(
        links.map(async (link) => {
          const linked = await this.findOne(accountId, { entityId: link.targetId });
          await this.calculateFormulas(accountId, linked);
        }),
      );

      this.entityEmitter.emitDeletedEvent(accountId, entity, { userNotification });
    }
  }

  async deleteMany(
    accountId: number,
    user: User,
    entityIds: number[],
    userNotification = UserNotification.Default,
  ): Promise<number> {
    let deleted = 0;
    for (const id of entityIds) {
      try {
        await this.delete(accountId, user, id, userNotification);
        deleted++;
      } catch (e) {
        if (!(e instanceof ForbiddenException)) throw e;
      }
    }
    return deleted;
  }
  //////////////////

  //////////////////
  // Linked entities
  //////////////////
  async findLinkedEntities({
    accountId,
    entityId,
    entityTypeId,
  }: {
    accountId: number;
    entityId: number;
    entityTypeId?: number;
  }): Promise<Entity[]> {
    const qb = this.repository
      .createQueryBuilder('e')
      .innerJoin(EntityLink, 'el', 'el.target_id = e.id and el.source_id = :entityId', { entityId })
      .where('e.account_id = :accountId', { accountId })
      .orderBy('el.sort_order');
    if (entityTypeId) {
      qb.andWhere('e.entity_type_id = :entityTypeId', { entityTypeId });
    }

    return qb.getMany();
  }

  async findFirstLinkedEntityByType(accountId: number, entityId: number): Promise<Entity[]> {
    const links = await this.entityLinkService.findMany({ accountId, sourceId: entityId });
    const entities = await this.repository.findBy({ id: In(links.map((l) => l.targetId)) });
    const groupedEntities = entities.reduce<EntityWithOrder>((acc, entity) => {
      const link = links.find((l) => l.targetId === entity.id);
      if (!acc[entity.entityTypeId]) {
        acc[entity.entityTypeId] = { entity, order: link.sortOrder };
      } else if (acc[entity.entityTypeId].order > link.sortOrder) {
        acc[entity.entityTypeId] = { entity, order: link.sortOrder };
      }
      return acc;
    }, {});
    return Object.values(groupedEntities).map((g) => g.entity);
  }

  async findLastLinkedEntity({
    accountId,
    entityId,
    category,
  }: {
    accountId: number;
    entityId: number;
    category: EntityCategory;
  }): Promise<Entity | null> {
    return this.repository
      .createQueryBuilder('e')
      .innerJoin('entity_link', 'el', 'el.target_id = e.id and el.source_id = :entityId', { entityId })
      .innerJoin('entity_type', 'et', 'et.id = e.entity_type_id and et.entity_category = :category', { category })
      .where('e.account_id = :accountId', { accountId })
      .orderBy('e.created_at', 'DESC')
      .getOne();
  }
  //////////////////

  //////////////////
  // Entity values helpers
  //////////////////
  private getClosedAt(closedAt: Date | null, stage: BoardStage | null | undefined): Date | null {
    return stage?.isSystem ? (closedAt ?? DateUtil.now()) : null;
  }
  //////////////////

  //////////////////
  // Weight helpers
  //////////////////
  private async calculateWeight({
    accountId,
    entityTypeId,
    boardId,
    afterId,
    beforeId,
  }: {
    accountId: number;
    entityTypeId: number;
    boardId: number | null;
    afterId?: number | null;
    beforeId?: number | null;
  }): Promise<number> {
    let afterWeight = afterId ? await this.getWeightById(accountId, afterId) : null;
    let beforeWeight = beforeId ? await this.getWeightById(accountId, beforeId) : null;
    if (afterWeight === null && beforeWeight === null) {
      const minWeight = await this.getMinWeight(accountId, entityTypeId, boardId);
      return minWeight - Weight.step;
    } else if (afterWeight !== null && beforeWeight === null) {
      beforeWeight = await this.getMinWeightMoreThan(accountId, entityTypeId, boardId, afterWeight);
      if (beforeWeight === null) {
        return afterWeight + Weight.step;
      }
    } else if (afterWeight === null && beforeWeight !== null) {
      afterWeight = await this.getMaxWeightLessThan(accountId, entityTypeId, boardId, beforeWeight);
      if (afterWeight === null) {
        return beforeWeight - Weight.step;
      }
    }
    return (afterWeight + beforeWeight) / 2.0;
  }

  private async getWeightById(accountId: number, id: number): Promise<number | null> {
    const result = await this.repository.findOne({ where: { accountId, id }, select: { weight: true } });
    return result ? result.weight : null;
  }

  private async getMinWeight(accountId: number, entityTypeId: number, boardId: number | null): Promise<number> {
    const query = this.repository
      .createQueryBuilder('e')
      .select('min(e.weight)', 'weight')
      .where('e.account_id = :accountId', { accountId })
      .andWhere('e.entity_type_id = :entityTypeId', { entityTypeId });
    if (boardId) {
      query.andWhere('e.board_id = :boardId', { boardId });
    }
    const { weight } = await query.getRawOne<{ weight: number | null }>();
    return weight ?? Weight.min;
  }

  private async getMinWeightMoreThan(
    accountId: number,
    entityTypeId: number,
    boardId: number | null,
    limitWeight: number,
  ): Promise<number | null> {
    const query = this.repository
      .createQueryBuilder('e')
      .select('min(e.weight)', 'weight')
      .where('e.account_id = :accountId', { accountId })
      .andWhere('e.entity_type_id = :entityTypeId', { entityTypeId })
      .andWhere('e.weight > :limitWeight', { limitWeight });
    if (boardId) {
      query.andWhere('e.board_id = :boardId', { boardId });
    }
    const { weight } = await query.getRawOne();
    return weight;
  }

  private async getMaxWeightLessThan(
    accountId: number,
    entityTypeId: number,
    boardId: number | null,
    limitWeight: number,
  ): Promise<number | null> {
    const query = this.repository
      .createQueryBuilder('e')
      .select('max(e.weight)', 'weight')
      .where('e.account_id = :accountId', { accountId })
      .andWhere('e.entity_type_id = :entityTypeId', { entityTypeId })
      .andWhere('e.weight < :limitWeight', { limitWeight });
    if (boardId) {
      query.andWhere('e.board_id = :boardId', { boardId });
    }
    const { weight } = await query.getRawOne();
    return weight;
  }
  //////////////////

  //////////////////
  // Field values
  //////////////////
  private async postProcessFieldValues(
    accountId: number,
    entity: Entity,
    updateParticipants: boolean,
    value: number | null | undefined,
    calculateFormulas: boolean,
  ) {
    if (updateParticipants) {
      entity.participantIds = await this.fieldValueService.getParticipantIds({ accountId, entityId: entity.id });
      await this.repository.update({ accountId, id: entity.id }, { participantIds: entity.participantIds });
    }
    if (value !== undefined && value !== null) {
      entity.value = value;
      await this.repository.update({ accountId, id: entity.id }, { value });
    }

    if (calculateFormulas) {
      await this.calculateFormulas(accountId, entity);
    }
  }

  async recalculateFormulas({ accountId, entityTypeId }: { accountId: number; entityTypeId: number }) {
    const batchSize = 100;
    let page = 0;
    let entities: Entity[];

    do {
      entities = await this.findMany(accountId, { entityTypeId }, new PagingQuery(page * batchSize, batchSize));

      for (const entity of entities) {
        await this.calculateFormulas(accountId, entity);

        const fieldValue = await this.fieldValueService.findOne({
          accountId,
          entityId: entity.id,
          type: FieldType.Value,
        });
        if (fieldValue) {
          entity.value = fieldValue.getValue<number>() ?? entity.value;
          await this.repository.update({ accountId, id: entity.id }, { value: entity.value });
        }
      }

      page++;
    } while (entities.length === batchSize);
  }

  private async calculateFormulas(accountId: number, entity: Entity) {
    const entityHierarchy = await this.buildCalculationHierarchy({ accountId, entity });
    await this.fieldValueService.calculateFormulas({
      accountId,
      calcEntity: entityHierarchy,
      previousEntityIds: [],
      hasUpdates: true,
    });
  }

  private async buildCalculationHierarchy({
    accountId,
    entity,
    previous = [],
  }: {
    accountId: number;
    entity: Entity;
    previous?: CalculateEntity[];
  }): Promise<CalculateEntity> {
    const children = previous.length ? [previous[previous.length - 1]] : [];
    const calcEntity = { entityId: entity.id, entityTypeId: entity.entityTypeId, recalculate: true, children };

    const links = await this.entityLinkService.findMany({ accountId, sourceId: entity.id });
    if (links.length) {
      const linkedEntities = await this.findMany(accountId, {
        entityId: links.map((l) => l.targetId),
        exclude: { entityId: previous.map((prev) => prev.entityId) },
      });
      if (linkedEntities.length) {
        const prevEntityTypeIds = previous.map((prev) => prev.entityTypeId);
        calcEntity.children.push(
          ...(await Promise.all(
            linkedEntities.map((linked) =>
              prevEntityTypeIds.includes(linked.entityTypeId)
                ? { entityId: linked.id, entityTypeId: linked.entityTypeId }
                : this.buildCalculationHierarchy({
                    accountId,
                    entity: linked,
                    previous: [...previous, { entityId: entity.id, entityTypeId: entity.entityTypeId }],
                  }),
            ),
          )),
        );
      }
    }

    return calcEntity;
  }
  //////////////////

  //////////////////
  // Field settings
  //////////////////
  private async checkFieldsRestriction(
    accountId: number,
    userId: number,
    entity: Entity,
    stageId: number | null,
    dto?: UpdateEntityDto,
  ) {
    if (dto) {
      const updatedFieldIds = dto.fieldValues?.filter((f) => f.state !== ObjectState.Unchanged)?.map((f) => f.fieldId);
      if (updatedFieldIds?.length > 0) {
        const readonlyFieldIds = await this.fieldSettingsService.getRestrictedFields({
          accountId,
          entityTypeId: entity.entityTypeId,
          access: FieldAccess.READONLY,
          userId,
        });
        if (updatedFieldIds.some((id) => readonlyFieldIds.includes(id))) {
          throw new ReadonlyFieldChangedError();
        }
      }
    }
    if (stageId) {
      const requiredFieldIds = await this.fieldSettingsService.getRestrictedFields({
        accountId,
        entityTypeId: entity.entityTypeId,
        access: FieldAccess.REQUIRED,
        userId,
        stageId,
      });
      if (requiredFieldIds.length > 0) {
        const fieldValues = await this.fieldValueService.findMany({ accountId, entityId: entity.id });
        for (const requiredFieldId of requiredFieldIds) {
          const dtoValue = dto?.fieldValues?.find((f) => f.fieldId === requiredFieldId);
          if (
            (dtoValue && dtoValue.state === ObjectState.Deleted) ||
            (!dtoValue && !fieldValues.find((fv) => fv.fieldId === requiredFieldId))
          ) {
            throw new RequiredFieldEmptyError();
          }
        }
      }
    }
  }

  private async excludeHiddenFields(accountId: number, userId: number, entity: Entity, fieldValues: FieldValue[]) {
    const hiddenFieldIds = await this.fieldSettingsService.getRestrictedFields({
      accountId,
      entityTypeId: entity.entityTypeId,
      access: FieldAccess.HIDDEN,
      userId,
      stageId: entity.stageId,
    });
    return hiddenFieldIds.length > 0 ? fieldValues.filter((f) => !hiddenFieldIds.includes(f.fieldId)) : fieldValues;
  }
  //////////////////

  //////////////////
  // Automation helpers
  //////////////////
  async applyAutomation({
    accountId,
    processId,
    entityTypeId,
    stageId,
  }: {
    accountId: number;
    processId: number;
    entityTypeId: number;
    stageId?: number | null;
  }) {
    const entities = await this.findMany(accountId, { entityTypeId, stageId });
    entities.forEach((entity) => this.entityEmitter.emitProcessStart({ accountId, entity, processId }));
  }
  //////////////////
}
