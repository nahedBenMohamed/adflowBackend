import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { GroupByDate, NumberUtil, DateUtil, DatePeriod } from '@/common';

import { Entity } from '../Model/Entity/Entity';

import { OwnerDateValue, ReportRowOwner } from './common';

interface EntityFieldFilter {
  fieldId: number;
  optionId?: number;
  optionsId?: number;
  switch?: boolean;
}
interface EntityTotalFilter {
  createdAt?: DatePeriod;
  closedAt?: DatePeriod;
  userIds?: number[];
  field?: EntityFieldFilter;
}
interface GroupBy {
  owner?: ReportRowOwner;
  userOwnerFieldId?: number;
  date?: { type: GroupByDate; fieldName: 'created_at' | 'closed_at' };
}
interface EntityTotal {
  quantity: OwnerDateValue[];
  amount: OwnerDateValue[];
  close: OwnerDateValue[];
  fieldQuantity: OwnerDateValue[];
  fieldAmount: OwnerDateValue[];
}

@Injectable()
export class CrmReportingService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Entity)
    private readonly entityRepository: Repository<Entity>,
  ) {}

  public async getEntityGroupBy(
    accountId: number,
    stageIds: number[],
    groupBy: GroupBy,
    include: { quantity?: boolean; amount?: boolean; close?: boolean; fieldQuantity?: number; fieldAmount?: number },
    filter: EntityTotalFilter,
  ): Promise<EntityTotal> {
    const qb = this.entityRepository.createQueryBuilder('e').where('e.account_id = :accountId', { accountId });
    if (stageIds.length) {
      qb.andWhere(`e.stage_id IN (:...stageIds)`, { stageIds: stageIds });
    }
    if (filter.createdAt) {
      if (filter.createdAt.from) {
        qb.andWhere(`e.created_at >= :createdAtFrom`, { createdAtFrom: filter.createdAt.from });
      }
      if (filter.createdAt.to) {
        qb.andWhere(`e.created_at <= :createdAtTo`, { createdAtTo: filter.createdAt.to });
      }
    }
    if (filter.closedAt) {
      if (filter.closedAt.from) {
        qb.andWhere(`e.closed_at >= :closedAtFrom`, { closedAtFrom: filter.closedAt.from });
      }
      if (filter.closedAt.to) {
        qb.andWhere(`e.closed_at <= :closedAtTo`, { closedAtTo: filter.closedAt.to });
      }
    }
    if (filter.userIds) {
      if (filter.userIds.length) {
        qb.andWhere(`u.id IN (:...userIds)`, { userIds: filter.userIds });
      } else {
        qb.andWhere(`e.responsible_user_id IS NULL`);
      }
    }

    if (groupBy.owner) {
      if (groupBy.userOwnerFieldId) {
        qb.innerJoin('field_value', 'fvuo', `fvuo.entity_id = e.id and fvuo.field_id = ${groupBy.userOwnerFieldId}`);
        qb.leftJoin('users', 'u', `u.id = (fvuo.payload->>'value')::integer`);
      } else {
        qb.leftJoin('users', 'u', 'e.responsible_user_id = u.id');
      }
      switch (groupBy.owner) {
        case 'user':
          qb.select('u.id', 'owner_id').groupBy('u.id');
          break;
        case 'department':
          qb.select('u.department_id', 'owner_id').groupBy('u.department_id');
          break;
        case 'total':
          qb.select('0::int', 'owner_id');
          break;
      }
    }
    if (groupBy.date) {
      const groupByDate = `TO_CHAR(DATE(e.${groupBy.date.fieldName}), '${this.getDatePattern(groupBy.date.type)}')`;
      qb.addSelect(groupByDate, 'date').addGroupBy(groupByDate);
    }

    if (filter.field?.fieldId && filter.field?.optionId) {
      // eslint-disable-next-line prettier/prettier
      qb.leftJoin('field_value', 'fvt', `fvt.entity_id = e.id and fvt.field_id = ${filter.field.fieldId}`)
        .andWhere(`fvt.payload @> '{"optionId": ${filter.field.optionId}}'`);
    } else if (filter.field?.fieldId && filter.field?.optionsId) {
      // eslint-disable-next-line prettier/prettier
      qb.leftJoin('field_value', 'fvt', `fvt.entity_id = e.id and fvt.field_id = ${filter.field.fieldId}`)
        .andWhere(`fvt.payload @> '{"optionIds": [${filter.field.optionsId}]}'`);
    } else if (filter.field?.fieldId && filter.field?.switch !== undefined) {
      qb.leftJoin('field_value', 'fvs', 'fvs.entity_id = e.id and fvs.field_id = :fvsId', {
        fvsId: filter.field.fieldId,
      });
      if (filter.field.switch) {
        qb.andWhere(`fvs.payload @> '{"value": true}'::jsonb`);
      } else {
        qb.andWhere(`(fvs.payload @> '{"value": true}'::jsonb OR fvs.id IS NULL)`);
      }
    }

    const [countByUser, countByField, amountByUser, amountByField, avgCloseByUser] = await Promise.all([
      include.quantity ? qb.clone().addSelect('count(e.id)', 'cnt').getRawMany() : Promise.resolve([]),
      include.fieldQuantity
        ? qb
            .clone()
            .addSelect(`count(e.id)`, 'field_cnt')
            .innerJoin('field_value', 'fv', `fv.entity_id = e.id and fv.field_id = :fieldQuantityId`, {
              fieldQuantityId: include.fieldQuantity,
            })
            .getRawMany()
        : Promise.resolve([]),
      include.amount
        ? qb
            .clone()
            .addSelect(`sum(cast(av.payload::json->>'value' as decimal))`, 'amount')
            .innerJoin('field_value', 'av', `av.entity_id = e.id and av.field_type = 'value'`)
            .getRawMany()
        : Promise.resolve([]),
      include.fieldAmount
        ? qb
            .clone()
            .addSelect(`sum(cast(fv.payload::json->>'value' as decimal))`, 'field_amount')
            .innerJoin('field_value', 'fv', `fv.entity_id = e.id and fv.field_id = :fieldAmountId`, {
              fieldAmountId: include.fieldAmount,
            })
            .getRawMany()
        : Promise.resolve([]),
      include.close
        ? qb
            .clone()
            .addSelect(`sum(extract(epoch from (e.closed_at - e.created_at)))`, 'close')
            .andWhere('e.closed_at is not null')
            .getRawMany()
        : Promise.resolve([]),
    ]);

    return {
      quantity: countByUser.map((c) => {
        return { ownerId: NumberUtil.toNumber(c.owner_id), value: NumberUtil.toNumber(c.cnt), date: c.date };
      }),
      amount: amountByUser.map((c) => {
        return { ownerId: NumberUtil.toNumber(c.owner_id), value: NumberUtil.toNumber(c.amount), date: c.date };
      }),
      close: avgCloseByUser.map((c) => {
        return { ownerId: NumberUtil.toNumber(c.owner_id), value: NumberUtil.toNumber(c.close), date: c.date };
      }),
      fieldQuantity: countByField.map((c) => {
        return { ownerId: NumberUtil.toNumber(c.owner_id), value: NumberUtil.toNumber(c.field_cnt), date: c.date };
      }),
      fieldAmount: amountByField.map((c) => {
        return { ownerId: NumberUtil.toNumber(c.owner_id), value: NumberUtil.toNumber(c.field_amount), date: c.date };
      }),
    };
  }

  public async getTaskOrActivityGroupBy(
    accountId: number,
    source: 'task' | 'activity',
    stageIds: number[],
    groupBy: GroupBy,
    options?: {
      resolved?: boolean;
      expired?: boolean;
      dateField?: string;
      period?: DatePeriod | null;
      ownerIds?: number[];
      departmentIds?: number[];
    },
  ): Promise<OwnerDateValue[]> {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('count(s.*)', 'cnt')
      .from(source, 's')
      .leftJoin('users', 'u', 's.responsible_user_id = u.id')
      .innerJoin('entity', 'e', 'e.id = s.entity_id')
      .where('s.account_id = :accountId', { accountId })
      .andWhere('e.stage_id IN (:...stageIds)', { stageIds });

    if (groupBy.owner) {
      switch (groupBy.owner) {
        case 'user':
          qb.addSelect('u.id', 'owner_id').groupBy('u.id');
          break;
        case 'department':
          qb.addSelect('u.department_id', 'owner_id').groupBy('u.department_id');
          break;
      }
    }
    if (groupBy.date) {
      const groupByDate = `TO_CHAR(DATE(s.${groupBy.date.fieldName}), '${this.getDatePattern(groupBy.date.type)}')`;
      qb.addSelect(groupByDate, 'date').addGroupBy(groupByDate);
    }

    if (options?.period && options?.dateField) {
      if (options.period.from) {
        qb.andWhere(`s.${options.dateField} >= :from`, { from: options.period.from });
      }
      if (options.period.to) {
        qb.andWhere(`s.${options.dateField} <= :to`, { to: options.period.to });
      }
    }

    if (options?.resolved === true) {
      qb.andWhere('s.is_resolved = true');
    } else if (options?.resolved === false) {
      qb.andWhere('s.is_resolved = false');
    }

    if (options?.expired) {
      qb.andWhere('s.end_date < :now', { now: DateUtil.now() });
    }

    if (options?.ownerIds?.length > 0) {
      qb.andWhere('s.responsible_user_id IN (:...ownerIds)', { ownerIds: options.ownerIds });
    }

    const countByUser = await qb.getRawMany();

    return countByUser.map((c) => {
      return { ownerId: NumberUtil.toNumber(c.owner_id), value: NumberUtil.toNumber(c.cnt), date: c.date };
    });
  }

  private getDatePattern(type: GroupByDate): string {
    switch (type) {
      case GroupByDate.Day:
        return 'YYYY-MM-DD';
      case GroupByDate.Week:
        return 'YYYY-WW';
      case GroupByDate.Month:
        return 'YYYY-MM';
      case GroupByDate.Quarter:
        return 'YYYY-Q';
      case GroupByDate.Year:
        return 'YYYY';
    }
  }
}
