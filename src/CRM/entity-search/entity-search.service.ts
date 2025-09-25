import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';

import { PagingMeta, PagingQuery } from '@/common';
import { buildSearchParams } from '@/database/common';
import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities';
import { EntityInfoService } from '@/modules/entity/entity-info';
import { FieldType } from '@/modules/entity/entity-field/common';

import { EntityCategory } from '../common';
import { Entity } from '../Model/Entity/Entity';
import { EntityService } from '../Service/Entity/EntityService';
import { EntityTypeService } from '../entity-type/entity-type.service';

import { EntitySearchForCallResultDto, EntitySearchFullResultDto, EntitySearchResultDto } from './dto';

interface SearchFilter {
  entityTypeId?: number | number[] | null;
  boardId?: number | number[] | null;
  name?: string | null;
  excludeEntityId?: number | number[] | null;
  fieldValue?: string | null;
  fieldType?: FieldType | null;
  searchInLinked?: boolean | null;
}

@Injectable()
export class EntitySearchService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Entity)
    private readonly repository: Repository<Entity>,
    private readonly authService: AuthorizationService,
    private readonly entityTypeService: EntityTypeService,
    @Inject(forwardRef(() => EntityService))
    private readonly entityService: EntityService,
    private readonly entityInfoService: EntityInfoService,
  ) {}

  async searchFull({
    accountId,
    user,
    filter,
    paging,
  }: {
    accountId: number;
    user: User;
    filter: SearchFilter;
    paging: PagingQuery;
  }): Promise<EntitySearchFullResultDto> {
    const { entities, total } = await this.search({ accountId, user, filter, paging });

    return {
      entities: await Promise.all(
        entities.map(async (entity) => await this.entityService.getDtoForEntity(accountId, user, entity, false)),
      ),
      meta: new PagingMeta(paging.skip + paging.take, total),
    };
  }

  async searchInfo({
    accountId,
    user,
    filter,
    paging,
  }: {
    accountId: number;
    user: User;
    filter: SearchFilter;
    paging: PagingQuery;
  }): Promise<EntitySearchResultDto> {
    const { entities, total } = await this.search({ accountId, user, filter, paging });

    return {
      entities: await Promise.all(
        entities.map(async (entity) => await this.entityInfoService.getEntityInfo({ user, entity, access: true })),
      ),
      meta: new PagingMeta(paging.skip + paging.take, total),
    };
  }

  async searchForCall({
    accountId,
    user,
    filter,
  }: {
    accountId: number;
    user: User;
    filter: SearchFilter;
  }): Promise<EntitySearchForCallResultDto> {
    const { entities } = await this.search({ accountId, user, filter, paging: { skip: 0, take: 1 } });
    const entity = entities.length
      ? await this.entityInfoService.getEntityInfo({ user, entity: entities[0], access: true })
      : null;

    if (entity) {
      const linked = await this.getLinkedForCall({ accountId, user, entityId: entity.id });

      return { entity, linked };
    }

    return { entity };
  }

  async search({
    accountId,
    user,
    filter,
    paging,
  }: {
    accountId: number;
    user: User;
    filter: SearchFilter;
    paging: PagingQuery;
  }): Promise<{ entities: Entity[]; total: number }> {
    const qb = this.repository.createQueryBuilder('entity').where('entity.account_id = :accountId', { accountId });

    const accessibleEntityTypes = await this.entityTypeService.getAccessibleForUser(accountId, user);
    const entityTypeIds = filter.entityTypeId
      ? Array.isArray(filter.entityTypeId)
        ? filter.entityTypeId
        : [filter.entityTypeId]
      : null;
    const entityTypes = entityTypeIds
      ? accessibleEntityTypes.filter((et) => entityTypeIds.includes(et.id))
      : accessibleEntityTypes;

    if (entityTypes.length) {
      const etWithResponsible = await Promise.all(
        entityTypes.map(async (entityType) => ({
          entityType,
          responsibles: await this.authService.whoCanView({ user, authorizable: entityType }),
        })),
      );
      qb.andWhere(
        new Brackets((qb1) => {
          etWithResponsible.forEach((et) =>
            qb1.orWhere(
              new Brackets((qb2) => {
                qb2.where(`entity.entity_type_id = ${et.entityType.id}`);
                if (et.responsibles) {
                  qb2.andWhere(
                    new Brackets((qb3) => {
                      qb3.where(`entity.created_by = ${user.id}`);
                      if (et.responsibles.length) {
                        qb3.orWhere(`entity.responsible_user_id IN (${et.responsibles.join(',')})`);
                      }
                    }),
                  );
                }
              }),
            ),
          );
        }),
      );
    } else {
      return { entities: [], total: 0 };
    }

    const nameFilter = buildSearchParams(filter.name);
    if (nameFilter?.length && filter.searchInLinked) {
      qb.addCommonTableExpression(
        this.dataSource
          .createQueryBuilder()
          .select('link.source_id', 'entity_id')
          .from('entity_link', 'link')
          .leftJoin('entity', 'linked', 'linked.id = link.target_id')
          .where(`linked.name_tsv @@ to_tsquery('${nameFilter}')`),
        'linked',
      );
    }

    const fieldFilter = buildSearchParams(filter.fieldValue);
    if (fieldFilter?.length) {
      const fqb = this.dataSource
        .createQueryBuilder()
        .select('fv.entity_id')
        .from('field_value', 'fv')
        .where(`fv.payload_tsv @@ to_tsquery('${fieldFilter}')`);
      if (filter.fieldType) {
        fqb.andWhere(`fv.field_type = '${filter.fieldType}'`);
      }
      qb.addCommonTableExpression(fqb, 'field_values');
      if (filter.searchInLinked) {
        qb.addCommonTableExpression(
          this.dataSource
            .createQueryBuilder()
            .select('link.source_id', 'entity_id')
            .from('entity_link', 'link')
            .leftJoin('entity', 'linked', 'linked.id = link.target_id')
            .where(`link.target_id IN (SELECT entity_id FROM field_values)`),
          'linked_field_values',
        );
      }
    }

    if (nameFilter?.length || fieldFilter?.length) {
      qb.andWhere(
        new Brackets((qb1) => {
          if (nameFilter?.length) {
            qb1.where('entity.name_tsv @@ to_tsquery(:name)', { name: nameFilter });
          }
          if (fieldFilter?.length) {
            qb1.orWhere('entity.id IN (SELECT entity_id FROM field_values)');
          }
          if (filter.searchInLinked) {
            if (nameFilter?.length) {
              qb1.orWhere('entity.id IN (SELECT entity_id FROM linked)');
            }
            if (fieldFilter?.length) {
              qb1.orWhere('entity.id IN (SELECT entity_id FROM linked_field_values)');
            }
          }
        }),
      );
    } else if (filter.name?.length || filter.fieldValue?.length) {
      qb.andWhere('1 = 0');
    }

    if (filter.excludeEntityId) {
      if (Array.isArray(filter.excludeEntityId)) {
        qb.andWhere('entity.id NOT IN (:...excludeEntityIds)', { excludeEntityIds: filter.excludeEntityId });
      } else {
        qb.andWhere('entity.id != :excludeEntityId', { excludeEntityId: filter.excludeEntityId });
      }
    }

    if (filter.boardId) {
      if (Array.isArray(filter.boardId)) {
        qb.andWhere('entity.board_id IN (:...boardIds)', { boardIds: filter.boardId });
      } else {
        qb.andWhere('entity.board_id = :boardId', { boardId: filter.boardId });
      }
    }

    const total = await qb.getCount();
    const entities = await qb
      .offset(paging.skip)
      .limit(paging.take)
      .orderBy('entity.created_at', 'DESC')
      .addOrderBy('entity.id', 'DESC')
      .getMany();

    return { entities, total };
  }

  private async getLinkedForCall({ accountId, user, entityId }: { accountId: number; user: User; entityId: number }) {
    const entity = await this.entityService.findLastLinkedEntity({
      accountId,
      entityId: entityId,
      category: EntityCategory.DEAL,
    });

    return entity ? this.entityInfoService.getEntityInfo({ user, entity, access: true }) : null;
  }
}
