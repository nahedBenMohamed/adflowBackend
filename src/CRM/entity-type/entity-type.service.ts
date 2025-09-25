import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { NotFoundError } from '@/common';

import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { ObjectPermissionService } from '@/modules/iam/object-permission/object-permission.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { ProductsSectionService } from '@/modules/inventory/products-section/services/products-section.service';
import { ScheduleService } from '@/modules/scheduler/schedule/services/schedule.service';
import { FieldType } from '@/modules/entity/entity-field/common/enums/field-type.enum';
import { FieldGroupService } from '@/modules/entity/entity-field/field-group/field-group.service';
import { FieldCode } from '@/modules/entity/entity-field/field/enums/field-code.enum';
import { FieldService } from '@/modules/entity/entity-field/field/field.service';

import { CrmEventType, EntityCategory, EntityTypeEvent, PermissionObjectType, SortOrder } from '../common';

import { BoardService } from '../board/board.service';
import { BoardType } from '../board';
import { EntityTypeLinkService } from '../entity-type-link/entity-type-link.service';
import { EntityTypeFeatureService, FeatureCode } from '../feature';
import { TaskSettingsService } from '../task-settings/task-settings.service';

import { CreateEntityTypeDto, EntityTypeDto, UpdateEntityTypeDto, UpdateEntityTypeFieldsDto } from './dto';
import { EntityType } from './entities';
import { SectionView } from './enums';
import { EntityTypeUsedInFormulaError } from './errors';

interface FindFilter {
  id?: number | number[];
  name?: string;
  category?: EntityCategory;
}

@Injectable()
export class EntityTypeService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(EntityType)
    private readonly repository: Repository<EntityType>,
    private readonly authService: AuthorizationService,
    private readonly objectPermissionService: ObjectPermissionService,
    private readonly fieldGroupService: FieldGroupService,
    private readonly fieldService: FieldService,
    private readonly entityTypeLinkService: EntityTypeLinkService,
    private readonly entityTypeFeatureService: EntityTypeFeatureService,
    private readonly taskSettingsService: TaskSettingsService,
    @Inject(forwardRef(() => BoardService))
    private readonly boardService: BoardService,
    private readonly productsSectionService: ProductsSectionService,
    private readonly scheduleService: ScheduleService,
  ) {}

  public async save(entityType: EntityType): Promise<EntityType> {
    return await this.repository.save(entityType);
  }

  public async create(accountId: number, user: User, dto: CreateEntityTypeDto): Promise<EntityTypeDto> {
    const sectionView = dto.entityCategory === EntityCategory.PROJECT ? SectionView.BOARD : dto.section.view;

    const entityType = await this.repository.save(
      new EntityType(
        accountId,
        dto.name,
        dto.entityCategory,
        dto.section.name,
        sectionView,
        dto.section.icon,
        dto.sortOrder ?? (await this.getMaxSortOrder(accountId)),
      ),
    );

    if (entityType.entityCategory === EntityCategory.PROJECT) {
      await this.createProjectSystemFields(entityType.accountId, entityType);
    }

    if (entityType.sectionView === SectionView.BOARD) {
      await this.boardService.create({
        accountId,
        user,
        dto: {
          name: entityType.name,
          type: BoardType.EntityType,
          recordId: entityType.id,
          sortOrder: 0,
        },
      });
    }

    await this.fieldGroupService.saveBatch({ accountId, entityTypeId: entityType.id, dtos: dto.fieldGroups });
    await this.fieldService.createMany({ accountId, entityTypeId: entityType.id, dtos: dto.fields });

    await this.entityTypeLinkService.processMany({ accountId, sourceId: entityType.id, dtos: dto.linkedEntityTypes });
    await this.entityTypeFeatureService.setFeaturesForEntityType(accountId, entityType.id, dto.featureCodes);

    if (dto.linkedProductsSectionIds) {
      await this.productsSectionService.linkSections(accountId, entityType.id, dto.linkedProductsSectionIds);
    }
    if (dto.linkedSchedulerIds) {
      await this.scheduleService.linkEntityType(accountId, dto.linkedSchedulerIds, entityType.id);
    }

    await this.createTaskSettingsIfNeeded(accountId, entityType.id, dto);

    if (entityType.entityCategory === EntityCategory.PROJECT) {
      await this.fieldService.updateFieldsSettings({
        accountId,
        entityTypeId: entityType.id,
        activeFieldCodes: dto.fieldsSettings.activeFieldCodes,
      });
    }

    return this.getDtoById(accountId, user, entityType.id);
  }

  private async getMaxSortOrder(accountId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('et')
      .select('MAX(et.sortOrder)', 'max')
      .where('et.accountId = :accountId', { accountId })
      .getRawOne();

    return Math.min(Number(result.max ?? 0) + 1, SortOrder.Last);
  }

  private async createTaskSettingsIfNeeded(accountId: number, entityTypeId: number, dto: CreateEntityTypeDto) {
    if (dto.featureCodes.includes(FeatureCode.TASK)) {
      await this.taskSettingsService.setTaskSettingsForEntityType(
        accountId,
        entityTypeId,
        dto.taskSettingsActiveFields,
      );
    }
  }

  public async getById(accountId: number, id: number): Promise<EntityType> {
    const entityType = await this.findOne(accountId, { id });
    if (!entityType) {
      throw NotFoundError.withId(EntityType, id);
    }

    return entityType;
  }

  public async getDtoById(accountId: number, user: User, id: number): Promise<EntityTypeDto> {
    const entityType = await this.getById(accountId, id);

    return this.createDto(accountId, user, entityType);
  }

  public async findOne(accountId: number, filter?: FindFilter): Promise<EntityType> {
    return this.createFindQb(accountId, filter).getOne();
  }

  public async findMany(accountId: number, filter?: FindFilter): Promise<EntityType[]> {
    return this.createFindQb(accountId, filter).orderBy('et.sort_order', 'ASC').getMany();
  }

  public async getDtosByAccountId(accountId: number, user: User): Promise<EntityTypeDto[]> {
    const entityTypes = await this.findMany(accountId);
    const dtos = [];

    for (const entityType of entityTypes) {
      dtos.push(await this.getDtoById(accountId, user, entityType.id));
    }

    return dtos;
  }

  public async getAccessibleForUser(accountId: number, user: User): Promise<EntityType[]> {
    const entityTypes = await this.findMany(accountId);
    const result: EntityType[] = [];
    for (const et of entityTypes) {
      if (await this.authService.check({ action: 'view', user, authorizable: et })) {
        result.push(et);
      }
    }
    return result;
  }

  public async findLinkedTypes(accountId: number, entityTypeId: number): Promise<EntityType[]> {
    const links = await this.entityTypeLinkService.findMany({ accountId, sourceId: entityTypeId });
    return this.repository.findBy({ id: In(links.map((l) => l.targetId)) });
  }

  public async update(
    accountId: number,
    user: User,
    entityTypeId: number,
    dto: UpdateEntityTypeDto,
  ): Promise<EntityTypeDto> {
    const links = await this.entityTypeLinkService.findMany({ accountId, sourceId: entityTypeId });
    const usedInFormula = await Promise.all(
      links.map(async (link) =>
        !dto.linkedEntityTypes.some((linked) => linked.targetId === link.targetId)
          ? await this.fieldService.checkFormulaUsageEntityType({
              accountId,
              entityTypeId,
              checkEntityTypeId: link.targetId,
            })
          : false,
      ),
    );
    if (usedInFormula.some((usage) => usage)) {
      throw new EntityTypeUsedInFormulaError();
    }

    await this.repository.update(
      { id: entityTypeId },
      {
        name: dto.name,
        entityCategory: dto.entityCategory,
        sectionName: dto.section.name,
        sectionView: dto.section.view,
        sectionIcon: dto.section.icon,
        sortOrder: dto.sortOrder,
      },
    );

    await this.fieldGroupService.saveBatch({ accountId, entityTypeId, dtos: dto.fieldGroups });
    await this.fieldService.updateBatch({ accountId, entityTypeId, dtos: dto.fields });

    await this.entityTypeLinkService.processMany({ accountId, sourceId: entityTypeId, dtos: dto.linkedEntityTypes });
    await this.entityTypeFeatureService.setFeaturesForEntityType(accountId, entityTypeId, dto.featureCodes);

    if (dto.linkedProductsSectionIds) {
      await this.productsSectionService.linkSections(accountId, entityTypeId, dto.linkedProductsSectionIds);
    }
    if (dto.linkedSchedulerIds) {
      await this.scheduleService.linkEntityType(accountId, dto.linkedSchedulerIds, entityTypeId);
    }

    if (dto.featureCodes.includes(FeatureCode.TASK)) {
      await this.taskSettingsService.setTaskSettingsForEntityType(
        accountId,
        entityTypeId,
        dto.taskSettingsActiveFields,
      );
    }
    if (dto.entityCategory === EntityCategory.PROJECT && dto.fieldsSettings) {
      await this.fieldService.updateFieldsSettings({
        accountId,
        entityTypeId,
        activeFieldCodes: dto.fieldsSettings.activeFieldCodes,
      });
    }

    return this.getDtoById(accountId, user, entityTypeId);
  }

  public async updateFields(
    accountId: number,
    user: User,
    entityTypeId: number,
    dto: UpdateEntityTypeFieldsDto,
  ): Promise<EntityTypeDto> {
    await this.fieldGroupService.saveBatch({ accountId, entityTypeId, dtos: dto.fieldGroups });
    await this.fieldService.updateBatch({ accountId, entityTypeId, dtos: dto.fields });

    return this.getDtoById(accountId, user, entityTypeId);
  }

  public async delete(accountId: number, userId: number, entityTypeId: number): Promise<void> {
    if (
      await this.fieldService.checkFormulaUsageEntityType({
        accountId,
        excludeEntityTypeId: entityTypeId,
        checkEntityTypeId: entityTypeId,
      })
    ) {
      throw new EntityTypeUsedInFormulaError();
    }

    await this.repository.delete({ id: entityTypeId, accountId });
    await this.objectPermissionService.delete({
      accountId,
      objectType: PermissionObjectType.EntityType,
      objectId: entityTypeId,
    });
    this.eventEmitter.emit(CrmEventType.EntityTypeDeleted, new EntityTypeEvent({ accountId, userId, entityTypeId }));
  }

  private async createDto(accountId: number, user: User, entityType: EntityType) {
    const fieldGroups = await this.fieldGroupService.findMany({ accountId, entityTypeId: entityType.id });
    const fields = await this.fieldService.findMany(
      { accountId, entityTypeId: entityType.id },
      { expand: ['options'] },
    );
    const links = await this.entityTypeLinkService.findMany({ accountId, sourceId: entityType.id });
    const featureCodes = await this.entityTypeFeatureService.getFeatureCodesForEntityType(accountId, entityType.id);
    const sectionIds = await this.productsSectionService.getLinkedSectionIds(accountId, user, entityType.id);
    const schedulerIds = await this.scheduleService.getLinkedSchedulerIds(accountId, { entityTypeId: entityType.id });

    return new EntityTypeDto({
      id: entityType.id,
      name: entityType.name,
      entityCategory: entityType.entityCategory,
      createdAt: entityType.createdAt.toISOString(),
      section: {
        name: entityType.sectionName,
        view: entityType.sectionView,
        icon: entityType.sectionIcon,
      },
      sortOrder: entityType.sortOrder,
      fieldGroups: fieldGroups.map((fieldGroup) => fieldGroup.toDto()),
      fields: fields.map((field) => field.toDto()),
      featureCodes: featureCodes,
      linkedEntityTypes: links.map((link) => link.toDto()),
      linkedProductsSectionIds: sectionIds,
      linkedSchedulerIds: schedulerIds,
    });
  }

  private async createProjectSystemFields(accountId: number, entityType: EntityType) {
    await this.fieldService.create({
      accountId,
      entityTypeId: entityType.id,
      dto: {
        name: 'Value',
        type: FieldType.Value,
        code: FieldCode.Value,
        active: true,
        sortOrder: -1,
        entityTypeId: entityType.id,
        fieldGroupId: null,
      },
    });
    await this.fieldService.create({
      accountId,
      entityTypeId: entityType.id,
      dto: {
        name: 'Start date',
        type: FieldType.Date,
        code: FieldCode.StartDate,
        active: true,
        sortOrder: -1,
        entityTypeId: entityType.id,
        fieldGroupId: null,
      },
    });
    await this.fieldService.create({
      accountId,
      entityTypeId: entityType.id,
      dto: {
        name: 'End date',
        type: FieldType.Date,
        code: FieldCode.EndDate,
        active: true,
        sortOrder: -1,
        entityTypeId: entityType.id,
        fieldGroupId: null,
      },
    });
    await this.fieldService.create({
      accountId,
      entityTypeId: entityType.id,
      dto: {
        name: 'Participants',
        type: FieldType.Participants,
        code: FieldCode.Participants,
        active: true,
        sortOrder: -1,
        entityTypeId: entityType.id,
        fieldGroupId: null,
      },
    });
    await this.fieldService.create({
      accountId,
      entityTypeId: entityType.id,
      dto: {
        name: 'Description',
        type: FieldType.Text,
        code: FieldCode.Description,
        active: true,
        sortOrder: -1,
        entityTypeId: entityType.id,
        fieldGroupId: null,
      },
    });
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder('et').where('et.account_id = :accountId', { accountId });

    if (filter?.id) {
      if (Array.isArray(filter.id)) {
        qb.andWhere('et.id IN (:...ids)', { ids: filter.id });
      } else {
        qb.andWhere('et.id = :id', { id: filter.id });
      }
    }
    if (filter?.name) {
      qb.andWhere('et.name = :name', { name: filter.name });
    }
    if (filter?.category) {
      qb.andWhere('et.entity_category = :category', { category: filter.category });
    }

    return qb;
  }
}
