import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QuantityAmount, NumberUtil, DatePeriod } from '@/common';
import { User } from '@/modules/iam/user/entities';
import { BoardStageService } from '@/CRM/board-stage/board-stage.service';
import { GroupedStages } from '@/CRM/board-stage/types';

import { Product } from '../product/entities/product.entity';
import { ProductCategory } from '../product-category/entities/product-category.entity';
import { ProductCategoryService } from '../product-category/product-category.service';

import { InventoryReportFilterDto } from './dto';
import { InventoryReportType } from './enums';
import { InventoryReport, InventoryReportRow } from './types';

enum GroupBy {
  Product,
  Category,
}
interface Filter {
  entityTypeId: number;
  sectionId: number;
  userIds?: number[];
  warehouseIds?: number[];
  categoryIds?: number[];
  period?: DatePeriod | null;
}

@Injectable()
export class InventoryReportingService {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
    private readonly stageService: BoardStageService,
    private readonly categoryService: ProductCategoryService,
  ) {}

  public async getReport({
    accountId,
    filter,
  }: {
    accountId: number;
    user: User;
    filter: InventoryReportFilterDto;
  }): Promise<InventoryReport> {
    const stages = await this.stageService.getGroupedByType({
      accountId,
      entityTypeId: filter.entityTypeId,
      boardId: filter.boardIds?.length ? filter.boardIds : undefined,
      type: filter.stageType,
    });

    const reportFilter: Filter = {
      entityTypeId: filter.entityTypeId,
      sectionId: filter.productsSectionId,
      userIds: filter.userIds,
      warehouseIds: filter.warehouseIds,
      categoryIds: filter.categoryIds,
      period: filter.period ? DatePeriod.fromFilter(filter.period) : undefined,
    };
    return filter.type === InventoryReportType.User
      ? this.getProductsUserReport({ accountId, filter: reportFilter, stages })
      : this.getProductsReport({ accountId, filter: reportFilter, stages, type: filter.type });
  }

  private async getProductsReport({
    accountId,
    filter,
    stages,
    type,
  }: {
    accountId: number;
    filter: Filter;
    stages: GroupedStages;
    type: InventoryReportType;
  }): Promise<InventoryReport> {
    const { entityTypeId, sectionId } = filter;
    const products =
      type !== InventoryReportType.Category
        ? await this.getProductReportGroupBy(accountId, entityTypeId, stages, sectionId, GroupBy.Product, filter)
        : null;

    const categories = await this.getProductReportGroupBy(
      accountId,
      entityTypeId,
      stages,
      sectionId,
      GroupBy.Category,
      filter,
    );

    if (categories.size) {
      await this.processCategories(accountId, sectionId, categories);
    }

    const total = await this.getProductReportGroupBy(accountId, entityTypeId, stages, sectionId, null, filter);

    return new InventoryReport(products, categories, total.values().next().value);
  }

  private async getProductsUserReport({
    accountId,
    filter,
    stages,
  }: {
    accountId: number;
    filter: Filter;
    stages: GroupedStages;
  }): Promise<InventoryReport> {
    const { entityTypeId, sectionId } = filter;
    const products = await this.getProductUserReportGroupBy(
      accountId,
      entityTypeId,
      stages,
      sectionId,
      GroupBy.Product,
      filter,
    );

    const categories = await this.getProductUserReportGroupBy(
      accountId,
      entityTypeId,
      stages,
      sectionId,
      GroupBy.Category,
      filter,
    );

    if (categories.size > 0) {
      await this.processCategories(accountId, sectionId, categories);
    }

    const total = await this.getProductUserReportGroupBy(accountId, entityTypeId, stages, sectionId, null, filter);

    return new InventoryReport(products, categories, total.values().next().value);
  }

  private async getProductReportGroupBy(
    accountId: number,
    entityTypeId: number,
    stages: { open: number[]; won: number[]; lost: number[] },
    productsSectionId: number,
    groupBy: GroupBy,
    filter?: Filter,
  ): Promise<Map<number, InventoryReportRow>> {
    const rowMap = new Map<number, InventoryReportRow>();

    const qb = this.createQb(accountId, entityTypeId, productsSectionId, groupBy, filter);

    const wonStageIds = stages.won?.join(',');
    if (wonStageIds?.length > 0) {
      qb.addSelect(`sum(oi.quantity) filter (where e.stage_id = any(array[${wonStageIds}]))`, 'sold_quantity');
      qb.addSelect(
        `sum(oi.unit_price * oi.quantity) filter (where e.stage_id = any(array[${wonStageIds}]))`,
        'sold_amount',
      );
      qb.leftJoin('field_value', 'fv', `e.id = fv.entity_id and fv.field_type = 'value'`);
      qb.addSelect(
        `avg((fv.payload->>'value')::numeric) filter (where e.stage_id = any(array[${wonStageIds}]))`,
        'avg_budget',
      );
      qb.addSelect(
        // eslint-disable-next-line max-len
        `avg(extract(epoch from age(e.closed_at, e.created_at))) filter (where e.stage_id = any(array[${wonStageIds}]))`,
        'avg_close_time',
      );
    }

    const lostStageIds = stages.lost?.join(',');
    if (lostStageIds?.length > 0) {
      qb.addSelect(`sum(oi.quantity) filter (where e.stage_id = any(array[${lostStageIds}]))`, 'lost_quantity');
      qb.addSelect(
        `sum(oi.unit_price * oi.quantity) filter (where e.stage_id = any(array[${lostStageIds}]))`,
        'lost_amount',
      );
    }

    const openStageIds = stages.open?.join(',');
    if (openStageIds?.length > 0) {
      qb.addSelect(`sum(oi.quantity) filter (where e.stage_id = any(array[${openStageIds}]))`, 'open_quantity');
      qb.addSelect(
        `sum(oi.unit_price * oi.quantity) filter (where e.stage_id = any(array[${openStageIds}]))`,
        'open_amount',
      );
    }

    qb.innerJoin('order_status', 'os', 'o.status_id = os.id');
    qb.addSelect(`sum(oi.quantity)`, 'all_quantity');
    qb.addSelect(`sum(oi.unit_price * oi.quantity)`, 'all_amount');
    qb.addSelect(`sum(oi.quantity) filter (where os.code = 'shipped')`, 'shipped_quantity');
    qb.addSelect(`sum(oi.unit_price * oi.quantity) filter (where os.code = 'shipped')`, 'shipped_amount');
    qb.addSelect(`sum(oi.quantity)::float / count(distinct e.id)`, 'avg_products');

    const rows = await qb.getRawMany();
    for (const row of rows) {
      rowMap.set(
        row.row_id,
        new InventoryReportRow(row.row_id, row.category_id ?? null, {
          productName: row.product_name,
          sold: new QuantityAmount(NumberUtil.toNumber(row.sold_quantity), NumberUtil.toNumber(row.sold_amount)),
          shipped: new QuantityAmount(
            NumberUtil.toNumber(row.shipped_quantity),
            NumberUtil.toNumber(row.shipped_amount),
          ),
          open: new QuantityAmount(NumberUtil.toNumber(row.open_quantity), NumberUtil.toNumber(row.open_amount)),
          lost: new QuantityAmount(NumberUtil.toNumber(row.lost_quantity), NumberUtil.toNumber(row.lost_amount)),
          all: new QuantityAmount(NumberUtil.toNumber(row.all_quantity), NumberUtil.toNumber(row.all_amount)),
          avgProducts: NumberUtil.toNumber(row.avg_products),
          avgBudget: NumberUtil.toNumber(row.avg_budget),
          avgTerm: NumberUtil.toNumber(row.avg_close_time),
        }),
      );
    }

    return rowMap;
  }

  private async getProductUserReportGroupBy(
    accountId: number,
    entityTypeId: number,
    stages: { open: number[]; won: number[]; lost: number[] },
    productsSectionId: number,
    groupBy: GroupBy,
    filter?: Filter,
  ): Promise<Map<number, InventoryReportRow>> {
    const rowMap = new Map<number, InventoryReportRow>();

    const qb = this.createQb(accountId, entityTypeId, productsSectionId, groupBy, filter);

    const wonStageIds = stages.won?.join(',');
    if (wonStageIds?.length > 0) {
      qb.addSelect(`sum(oi.quantity) filter (where e.stage_id = any(array[${wonStageIds}]))`, 'sold_quantity');
      qb.addSelect(
        `sum(oi.unit_price * oi.quantity) filter (where e.stage_id = any(array[${wonStageIds}]))`,
        'sold_amount',
      );
    }

    const soldRows = await qb.getRawMany();
    for (const row of soldRows) {
      if (row.sold_quantity || row.sold_amount) {
        rowMap.set(
          row.row_id,
          new InventoryReportRow(row.row_id, row.category_id ?? null, {
            productName: row.product_name,
            sold: new QuantityAmount(NumberUtil.toNumber(row.sold_quantity), NumberUtil.toNumber(row.sold_amount)),
          }),
        );
      }
    }

    const userRows = await qb
      .clone()
      .addSelect('e.responsible_user_id', 'owner_id')
      .addGroupBy('e.responsible_user_id')
      .getRawMany();
    for (const row of userRows) {
      if (row.sold_quantity || row.sold_amount) {
        const reportRow = rowMap.get(row.row_id) ?? new InventoryReportRow(row.row_id, row.category_id ?? null);
        reportRow.addUser(
          row.owner_id,
          new QuantityAmount(NumberUtil.toNumber(row.sold_quantity), NumberUtil.toNumber(row.sold_amount)),
        );

        rowMap.set(row.row_id, reportRow);
      }
    }

    return rowMap;
  }

  private createQb(
    accountId: number,
    entityTypeId: number,
    productsSectionId: number,
    groupBy: GroupBy,
    filter?: Filter,
  ) {
    const qb = this.repository
      .createQueryBuilder('p')
      .innerJoin('order_item', 'oi', 'p.id = oi.product_id')
      .innerJoin('orders', 'o', 'oi.order_id = o.id')
      .innerJoin('entity', 'e', 'o.entity_id = e.id')
      .where('p.account_id = :accountId', { accountId })
      .andWhere('p.section_id = :productsSectionId', { productsSectionId })
      .andWhere('e.entity_type_id = :entityTypeId', { entityTypeId });

    if (groupBy === GroupBy.Product) {
      qb.select('p.id', 'row_id')
        .addSelect('p.category_id', 'category_id')
        .addSelect('p.name', 'product_name')
        .groupBy('p.id')
        .addGroupBy('p.category_id')
        .addGroupBy('p.name');
    } else if (groupBy === GroupBy.Category) {
      qb.select('p.category_id', 'row_id').groupBy('p.category_id');
    } else {
      qb.select('0', 'row_id');
    }

    if (filter?.userIds?.length > 0) {
      qb.andWhere('e.responsible_user_id IN (:...userIds)', { userIds: filter.userIds });
    }
    if (filter?.warehouseIds?.length > 0) {
      qb.andWhere('o.warehouse_id IN (:...warehouseIds)', { warehouseIds: filter.warehouseIds });
    }
    if (filter?.categoryIds?.length > 0) {
      qb.andWhere('p.category_id IN (:...categoryIds)', { categoryIds: filter.categoryIds });
    }
    if (filter?.period?.from) {
      qb.andWhere('o.created_at >= :from', { from: filter.period.from });
    }
    if (filter?.period?.to) {
      qb.andWhere('o.created_at <= :to', { to: filter.period.to });
    }

    return qb;
  }

  private async processCategories(accountId: number, sectionId: number, rowsMap: Map<number, InventoryReportRow>) {
    const categories = await this.categoryService.getCategories(accountId, sectionId, null);

    if (categories?.length > 0) {
      this.aggregateData(categories, rowsMap);
    }
  }
  private aggregateData(categories: ProductCategory[], rowsMap: Map<number, InventoryReportRow>) {
    const aggregateSubordinates = (category: ProductCategory): InventoryReportRow | null => {
      let aggregatedRow = rowsMap.get(category.id) || InventoryReportRow.empty(category.id, null);

      let hasValue = rowsMap.has(category.id);
      category.children.forEach((child) => {
        const childRow = aggregateSubordinates(child);
        if (childRow) {
          aggregatedRow = aggregatedRow.add(childRow);
          hasValue = true;
        }
      });
      return hasValue ? aggregatedRow : null;
    };

    categories.forEach((category) => {
      const aggregatedRow = aggregateSubordinates(category);
      if (aggregatedRow) {
        rowsMap.set(category.id, aggregatedRow);
      }
    });
  }
}
