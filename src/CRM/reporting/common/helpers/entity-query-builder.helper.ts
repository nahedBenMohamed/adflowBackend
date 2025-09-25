import { SelectQueryBuilder } from 'typeorm';

import { DatePeriod, PagingQuery } from '@/common';
import { Entity } from '../../../Model/Entity/Entity';

interface Conditions {
  accountId?: number | null;
  entityTypeIds?: number[] | null;
  stageIds?: number[] | null;
  search?: string | null;
  createdAt?: DatePeriod | null;
  closedAt?: DatePeriod | null;
  ownerIds?: number[] | null;
}

export class EntityQueryBuilderHelper {
  public static addConditions(qb: SelectQueryBuilder<Entity>, conditions?: Conditions, paging?: PagingQuery) {
    if (conditions.accountId) {
      qb.andWhere('e.account_id = :accountId', { accountId: conditions.accountId });
    }

    if (conditions.entityTypeIds?.length) {
      qb.andWhere(`e.entity_type_id IN (:...entityTypeIds)`, { entityTypeIds: conditions.entityTypeIds });
    }

    if (conditions.stageIds?.length) {
      qb.andWhere(`e.stage_id IN (:...stageIds)`, { stageIds: conditions.stageIds });
    }

    if (conditions.search) {
      qb.andWhere(`e.name ILIKE :search`, { search: `%${conditions.search}%` });
    }

    if (conditions.createdAt) {
      EntityQueryBuilderHelper.addDateCondition(qb, conditions.createdAt, 'created_at');
    }

    if (conditions.closedAt) {
      EntityQueryBuilderHelper.addDateCondition(qb, conditions.closedAt, 'closed_at');
    }

    if (conditions.ownerIds) {
      if (conditions.ownerIds.length) {
        qb.andWhere(`e.responsible_user_id in (:...ownerIds)`, { ownerIds: conditions.ownerIds });
      } else {
        qb.andWhere(`e.responsible_user_id is null`);
      }
    }

    if (paging) {
      qb.offset(paging.skip).limit(paging.take);
    }

    return qb;
  }

  private static addDateCondition(qb: SelectQueryBuilder<Entity>, dates: DatePeriod, fieldName: string) {
    if (dates.from) {
      qb.andWhere(`e.${fieldName} >= :${fieldName}_from`, { [`${fieldName}_from`]: dates.from });
    }
    if (dates.to) {
      qb.andWhere(`e.${fieldName} <= :${fieldName}_to`, { [`${fieldName}_to`]: dates.to });
    }
  }
}
