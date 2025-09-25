import { Brackets, type Repository, type SelectQueryBuilder } from 'typeorm';

import { DatePeriod, DatePeriodFilter, intersection } from '@/common';

import { TaskSorting } from './TaskSorting';
import { BaseTaskBoardFilter } from './BaseTaskBoardFilter';

export class TaskBoardQueryHelper {
  public static createBoardQueryBuilder<T>(
    accountId: number,
    userId: number,
    repository: Repository<T>,
    filter: BaseTaskBoardFilter,
    responsibles: number[],
    withOrder: boolean,
    titleField: string,
  ): SelectQueryBuilder<T> {
    const qb = repository.createQueryBuilder().where('account_id = :accountId', { accountId });

    const users = intersection(filter.ownerIds, responsibles);
    if (users) {
      if (users.length > 0) {
        qb.andWhere(
          new Brackets((qb1) => {
            qb1.where('responsible_user_id IN (:...users)', { users });
            if (!filter.ownerIds) {
              qb1.orWhere('created_by = :userId', { userId });
            }
          }),
        );
      } else {
        qb.andWhere(
          new Brackets((qb1) => {
            qb1.where('responsible_user_id IS NULL');
            if (!filter.ownerIds) {
              qb1.orWhere('created_by = :userId', { userId });
            }
          }),
        );
      }
    }

    if (filter.createdBy?.length) {
      qb.andWhere('created_by IN (:...createdBy)', { createdBy: filter.createdBy });
    }

    if (filter.search) {
      qb.andWhere(`${titleField} ILIKE :search`, { search: `%${filter.search}%` });
    }

    if (filter.entityIds) {
      qb.andWhere('entity_id IN (:...entityIds)', { entityIds: filter.entityIds });
    }

    if (filter.createdAt) {
      TaskBoardQueryHelper.addDateCondition(qb, filter.createdAt, 'created_at');
    }

    if (filter.startDate) {
      TaskBoardQueryHelper.addDateCondition(qb, filter.startDate, 'start_date');
    }

    if (filter.endDate) {
      TaskBoardQueryHelper.addDateCondition(qb, filter.endDate, 'end_date');
    }

    if (filter.resolvedDate) {
      TaskBoardQueryHelper.addDateCondition(qb, filter.resolvedDate, 'resolved_date');
    }

    if (withOrder) {
      TaskBoardQueryHelper.addBoardOrderBy(qb, filter.sorting);
    }

    return qb;
  }

  private static addDateCondition<T>(qb: SelectQueryBuilder<T>, dateFilter: DatePeriodFilter, fieldName: string) {
    const dates = DatePeriod.fromFilter(dateFilter);
    if (dates.from) {
      qb.andWhere(`${fieldName} >= :${fieldName}from`, { [`${fieldName}from`]: dates.from });
    }
    if (dates.to) {
      qb.andWhere(`${fieldName} <= :${fieldName}to`, { [`${fieldName}to`]: dates.to });
    }
    return qb;
  }

  public static addBoardOrderBy<T>(qb: SelectQueryBuilder<T>, sorting: TaskSorting | null | undefined) {
    switch (sorting) {
      case TaskSorting.MANUAL:
        qb.orderBy('weight', 'ASC');
        break;
      case TaskSorting.CREATED_ASC:
        qb.orderBy('created_at', 'ASC');
        break;
      case TaskSorting.CREATED_DESC:
        qb.orderBy('created_at', 'DESC');
        break;
      default:
        qb.orderBy('weight', 'ASC');
        break;
    }
    return qb.addOrderBy('id', 'DESC');
  }
}
