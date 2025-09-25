import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { DatePeriod, ForbiddenError, intersection, NumberUtil, PagingQuery, QuantityAmount } from '@/common';

import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities';
import { FieldType } from '@/modules/entity/entity-field/common/enums/field-type.enum';
import { FieldService } from '@/modules/entity/entity-field/field/field.service';

import { EntityCategory } from '../../common';
import { GroupedStages } from '../../board-stage/types';
import { BoardStageService } from '../../board-stage/board-stage.service';
import { EntityType } from '../../entity-type/entities';
import { Entity } from '../../Model/Entity/Entity';

import { CustomerReportFilterDto } from './dto';
import { CustomerReportType } from './enums';
import {
  CustomerReport,
  CustomerReportRow,
  CustomerReportMeta,
  CustomerReportFieldMeta,
  CustomerReportField,
} from './types';

interface Filter {
  entityTypeId: number;
  type?: CustomerReportType | null;
  userIds?: number[] | null;
  period?: DatePeriod;
}

@Injectable()
export class CustomerReportService {
  constructor(
    @InjectRepository(Entity)
    private readonly repository: Repository<Entity>,
    private readonly dataSource: DataSource,
    private readonly authService: AuthorizationService,
    private readonly stageService: BoardStageService,
    private readonly fieldService: FieldService,
  ) {}

  public async getReport({
    accountId,
    user,
    filter,
    paging,
  }: {
    accountId: number;
    user: User;
    filter: CustomerReportFilterDto;
    paging: PagingQuery;
  }) {
    const { allow, userIds: allowedUserIds } = await this.authService.getPermissions({
      action: 'report',
      user,
      authorizable: EntityType.getAuthorizable(filter.entityTypeId),
    });
    if (!allow) {
      throw new ForbiddenError();
    }
    const userIds = filter.ownerIds?.length ? intersection(filter.ownerIds, allowedUserIds) : allowedUserIds;

    const stages = await this.stageService.getGroupedByType({
      accountId,
      entityTypeId: filter.entityTypeId,
      boardId: filter.boardIds?.length ? filter.boardIds : undefined,
    });

    const fieldsMeta = await this.getFieldsMeta({ accountId, entityTypeId: filter.entityTypeId });

    //HACK: for overall report
    if (filter.type === CustomerReportType.ContactCompany) {
      filter.type = null;
    }

    const groupFilter: Filter = {
      entityTypeId: filter.entityTypeId,
      type: filter.type,
      userIds,
      period: filter.period ? DatePeriod.fromFilter(filter.period) : undefined,
    };
    const rows = await this.getGroupBy({ accountId, stages, isTotal: false, fieldsMeta, filter: groupFilter, paging });
    // const totalRow = filter.type
    //   ? await this.getGroupBy({ accountId, stages, isTotal: true, fieldsMeta, filter: groupFilter })
    //   : null;
    const total = await this.createQb({ accountId, stages, isTotal: false, filter: groupFilter, fieldsMeta })
      .select('count(distinct(te.id))::integer', 'cnt')
      .orderBy()
      .groupBy()
      .getRawOne();

    return new CustomerReport(
      Array.from(rows.values()),
      // eslint-disable-next-line max-len
      CustomerReportRow.empty(0, 0, null), //totalRow ? totalRow.values().next().value : CustomerReportRow.empty(0, 0, null),
      new CustomerReportMeta({ offset: paging.skip + paging.take, total: total.cnt, fields: fieldsMeta }),
    );
  }

  private async getGroupBy({
    accountId,
    stages,
    isTotal,
    filter,
    fieldsMeta,
    paging,
  }: {
    accountId: number;
    stages: GroupedStages;
    isTotal: boolean;
    filter: Filter;
    fieldsMeta: CustomerReportFieldMeta[];
    paging?: PagingQuery;
  }): Promise<Map<number, CustomerReportRow>> {
    const rowMap = new Map<number, CustomerReportRow>();
    const qb = this.createQb({ accountId, stages, isTotal, filter, fieldsMeta });
    if (paging) {
      qb.offset(paging.skip).limit(paging.take);
    }
    const rows = await qb.getRawMany();
    for (const row of rows) {
      const fields = new Map<number, CustomerReportField>();
      for (const fieldMeta of fieldsMeta) {
        const value = NumberUtil.toNumber(row[`fv_${fieldMeta.fieldId}_amount`]);
        if (value) {
          fields.set(fieldMeta.fieldId, new CustomerReportField(fieldMeta.fieldId, fieldMeta.fieldName, value));
        }
      }
      rowMap.set(
        row.owner_id,
        new CustomerReportRow(
          row.owner_id,
          row.owner_entity_type_id,
          row.owner_name ?? null,
          NumberUtil.toNumber(row.won_product_quantity),
          new QuantityAmount(NumberUtil.toNumber(row.won_quantity), NumberUtil.toNumber(row.won_amount)),
          new QuantityAmount(NumberUtil.toNumber(row.open_quantity), NumberUtil.toNumber(row.open_amount)),
          new QuantityAmount(NumberUtil.toNumber(row.lost_quantity), NumberUtil.toNumber(row.lost_amount)),
          new QuantityAmount(NumberUtil.toNumber(row.all_quantity), NumberUtil.toNumber(row.all_amount)),
          NumberUtil.toNumber(row.won_avg_quantity),
          NumberUtil.toNumber(row.won_avg_amount),
          NumberUtil.toNumber(row.won_avg_time),
          fields,
        ),
      );
    }
    return rowMap;
  }

  private createQb({
    accountId,
    stages,
    isTotal,
    filter,
    fieldsMeta,
  }: {
    accountId: number;
    stages: GroupedStages;
    isTotal: boolean;
    filter: Filter;
    fieldsMeta: CustomerReportFieldMeta[];
  }) {
    const qb = this.repository
      .createQueryBuilder('se')
      .select(`count(se.id)::integer`, 'all_quantity')
      .addSelect(`coalesce(sum(cast(se_fv.payload::json->>'value' as decimal)), 0)::decimal`, 'all_amount')
      .innerJoin('entity_link', 'el', 'el.target_id = se.id')
      .innerJoin('entity', 'te', 'te.id = el.source_id')
      .innerJoin('entity_type', 'te_et', 'te_et.id = te.entity_type_id')
      .leftJoin('orders', 'se_o', 'se_o.entity_id = se.id')
      .leftJoin('order_item', 'se_oi', 'se_oi.order_id = se_o.id')
      .leftJoin('field_value', 'se_fv', `se_fv.entity_id = se.id and se_fv.field_type = '${FieldType.Value}'`)
      .where('se.account_id = :accountId', { accountId })
      .andWhere('se.entity_type_id = :entityTypeId', { entityTypeId: filter.entityTypeId })
      .andWhere('te_et.entity_category in (:...types)', {
        types: filter.type ? [filter.type] : [EntityCategory.COMPANY, EntityCategory.CONTACT],
      });
    if (isTotal) {
      qb.addSelect('0::integer', 'owner_id');
    } else {
      qb.addSelect('te.entity_type_id', 'owner_entity_type_id')
        .addSelect('te.id', 'owner_id')
        .addSelect('te.name', 'owner_name')
        .groupBy('te.entity_type_id')
        .addGroupBy('te.id')
        .addGroupBy('te.name');
    }
    if (stages.all?.length > 0) {
      qb.andWhere('se.stage_id in (:...stageIds)', { stageIds: stages.all });
    }
    if (stages.open?.length > 0) {
      qb.addSelect(
        `count(se.id) filter (where se.stage_id in (${stages.open.join(',')}))::integer`,
        'open_quantity',
      ).addSelect(
        // eslint-disable-next-line max-len
        `coalesce(sum(cast(se_fv.payload::json->>'value' as decimal)) filter (where se.stage_id in (${stages.open.join(',')})), 0)::decimal`,
        'open_amount',
      );
    }
    if (stages.won?.length > 0) {
      qb.addSelect(`count(se.id) filter (where se.stage_id in (${stages.won.join(',')}))::integer`, 'won_quantity')
        .addSelect(
          // eslint-disable-next-line max-len
          `coalesce(sum(cast(se_fv.payload::json->>'value' as decimal)) filter (where se.stage_id in (${stages.won.join(',')})), 0)::decimal`,
          'won_amount',
        )
        .addSelect(
          // eslint-disable-next-line max-len
          `coalesce(avg(cast(se_fv.payload::json->>'value' as decimal)) filter (where se.stage_id in (${stages.won.join(',')})), 0)::decimal`,
          'won_avg_amount',
        )
        .addSelect(
          // eslint-disable-next-line max-len
          `coalesce(avg(extract(EPOCH from (se.closed_at - se.created_at))) filter (where se.stage_id in (${stages.won.join(',')})), 0)::decimal`,
          'won_avg_time',
        )
        .addSelect(
          `coalesce(sum(se_oi.quantity) filter (where se.stage_id in (${stages.won.join(',')})), 0)::decimal`,
          'won_product_quantity',
        )
        .orderBy('won_amount', 'DESC')
        .addOrderBy('won_quantity', 'DESC')
        .addOrderBy('all_amount', 'DESC')
        .addOrderBy('all_quantity', 'DESC');

      qb.addCommonTableExpression(
        this.dataSource
          .createQueryBuilder()
          .select('el.source_id', 'owner_id')
          .addSelect(`date_trunc('month', se.created_at)`, 'month')
          .addSelect('COUNT(se.id)', 'monthly_deal_count')
          .from('entity', 'se')
          .innerJoin('entity_link', 'el', 'el.target_id = se.id')
          .where(`se.account_id = ${accountId}`)
          .andWhere(`se.entity_type_id = ${filter.entityTypeId}`)
          .groupBy('el.source_id')
          .addGroupBy(`date_trunc('month', se.created_at)`),
        'se_month_counts',
      ).leftJoin(
        // eslint-disable-next-line max-len
        '(SELECT owner_id, AVG(monthly_deal_count)::integer AS won_avg_quantity FROM se_month_counts GROUP BY owner_id)',
        'se_month_avg',
        'se_month_avg.owner_id = te.id',
      );
      if (isTotal) {
        qb.addSelect('AVG(se_month_avg.won_avg_quantity)', 'won_avg_quantity');
      } else {
        qb.addSelect('se_month_avg.won_avg_quantity', 'won_avg_quantity').addGroupBy('se_month_avg.won_avg_quantity');
      }
    } else {
      qb.orderBy('all_amount', 'DESC').addOrderBy('all_quantity', 'DESC');
    }
    if (stages.lost?.length > 0) {
      qb.addSelect(
        `count(se.id) filter (where se.stage_id in (${stages.lost.join(',')}))::integer`,
        'lost_quantity',
      ).addSelect(
        // eslint-disable-next-line max-len
        `coalesce(sum(cast(se_fv.payload::json->>'value' as decimal)) filter (where se.stage_id in (${stages.lost.join(',')})), 0)::decimal`,
        'lost_amount',
      );
    }
    if (filter.userIds?.length) {
      qb.andWhere('se.responsible_user_id in (:...userIds)', { userIds: filter.userIds });
    }
    if (filter.period?.from) {
      qb.andWhere('se.created_at >= :from', { from: filter.period.from });
    }
    if (filter.period?.to) {
      qb.andWhere('se.created_at <= :to', { to: filter.period.to });
    }
    for (const fieldMeta of fieldsMeta) {
      const fieldKey = `fv_${fieldMeta.fieldId}`;
      qb.leftJoin(
        // eslint-disable-next-line max-len
        `(select entity_id, sum(cast(payload::json->>'value' as decimal)) as amount from field_value where field_id = ${fieldMeta.fieldId} group by entity_id)`,
        fieldKey,
        `${fieldKey}.entity_id = se.id`,
      ).addSelect(`sum(${fieldKey}.amount)`, `${fieldKey}_amount`);
    }
    return qb;
  }

  private async getFieldsMeta({
    accountId,
    entityTypeId,
  }: {
    accountId: number;
    entityTypeId: number;
  }): Promise<CustomerReportFieldMeta[]> {
    const fieldsMeta: CustomerReportFieldMeta[] = [];

    const formulaFields = await this.fieldService.findMany({ accountId, entityTypeId, type: FieldType.Formula });
    for (const field of formulaFields) {
      fieldsMeta.push(new CustomerReportFieldMeta(field.id, field.name));
    }

    return fieldsMeta;
  }
}
