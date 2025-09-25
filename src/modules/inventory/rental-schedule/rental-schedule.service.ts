import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThanOrEqual, Repository, SelectQueryBuilder } from 'typeorm';

import { DatePeriod, DatePeriodDto, DateUtil, isUnique, PagingQuery } from '@/common';

import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { EntityInfoService } from '@/modules/entity/entity-info/entity-info.service';

import { ProductsFilter } from '../product/dto/products-filter';
import { ProductService } from '../product/product.service';
import { RentalOrderStatus } from '../rental-order/enums';
import { RentalOrderService } from '../rental-order/services/rental-order.service';
import { RentalOrder } from '../rental-order/entities/rental-order.entity';

import { CheckRentalStatusDto } from './dto';
import { RentalEvent } from './entities';
import { RentalScheduleStatus } from './enums';
import { RentalSchedule, ProductRentalStatus } from './types';

@Injectable()
export class RentalScheduleService {
  constructor(
    @InjectRepository(RentalEvent)
    private readonly repository: Repository<RentalEvent>,
    private readonly authService: AuthorizationService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    @Inject(forwardRef(() => RentalOrderService))
    private readonly rentalOrderService: RentalOrderService,
    private readonly entityInfoService: EntityInfoService,
  ) {}

  public async getSchedule(
    accountId: number,
    user: User,
    sectionId: number,
    periodDto: DatePeriodDto,
    filter: ProductsFilter,
    paging: PagingQuery,
  ): Promise<RentalSchedule> {
    await this.authService.check({
      action: 'view',
      user,
      authorizable: RentalOrder.getAuthorizable(sectionId),
      throwError: true,
    });

    const products = await this.productService.getProductsSimple(accountId, sectionId, filter, paging);
    if (products.length === 0) {
      return new RentalSchedule([], []);
    }

    const events = await this.buildSchedule(accountId, sectionId, DatePeriod.fromDto(periodDto), {
      productId: products.map((p) => p.id),
    });

    if (events.length === 0) {
      return new RentalSchedule(products, []);
    }

    const itemsWithEntity = await this.rentalOrderService.getEntityIdsByOrderItemIds(
      events.map((e) => e.orderItemId).filter(isUnique),
    );
    const entityIds = itemsWithEntity.map((i) => i.entityId).filter(isUnique);
    const entityInfos =
      entityIds.length > 0 ? await this.entityInfoService.findMany({ accountId, user, entityIds }) : [];

    for (const event of events) {
      const itemWithEntity = itemsWithEntity.find((i) => i.orderItemId === event.orderItemId);
      if (itemWithEntity) {
        event.entityInfo = entityInfos.find((i) => i.id === itemWithEntity.entityId);
      }
    }

    return new RentalSchedule(products, events);
  }

  public async getProductSchedule(
    accountId: number,
    user: User,
    sectionId: number,
    productId: number,
    periodDto: DatePeriodDto,
  ): Promise<RentalEvent[]> {
    await this.authService.check({
      action: 'view',
      user,
      authorizable: RentalOrder.getAuthorizable(sectionId),
      throwError: true,
    });

    return await this.buildSchedule(accountId, sectionId, DatePeriod.fromDto(periodDto), { productId });
  }

  public async processOrder(accountId: number, order: RentalOrder): Promise<void> {
    switch (order.status) {
      case RentalOrderStatus.Formed:
      case RentalOrderStatus.Cancelled:
        await this.releaseProducts(accountId, order);
        break;
      case RentalOrderStatus.Reserved:
      case RentalOrderStatus.SentToWarehouse:
        await this.releaseProducts(accountId, order);
        await this.blockProducts(accountId, order, RentalScheduleStatus.Reserved);
        break;
      case RentalOrderStatus.Shipped:
      case RentalOrderStatus.Delivered:
        await this.releaseProducts(accountId, order);
        await this.blockProducts(accountId, order, RentalScheduleStatus.Rented);
        break;
      case RentalOrderStatus.Returned:
      case RentalOrderStatus.AcceptedToWarehouse:
        await this.releaseProductsFromDate(accountId, order, DateUtil.now());
        break;
    }
  }

  public async releaseProductByDates(
    accountId: number,
    user: User,
    sectionId: number,
    productId: number,
    period: DatePeriodDto,
  ): Promise<void> {
    await this.authService.check({
      action: 'edit',
      user,
      authorizable: RentalOrder.getAuthorizable(sectionId),
      throwError: true,
    });

    const startDate = DateUtil.fromISOString(period.startDate);
    const endDate = DateUtil.fromISOString(period.endDate);

    await this.releaseInnerEvents(accountId, sectionId, productId, startDate, endDate);
    await this.splitOuterEvent(accountId, sectionId, productId, startDate, endDate);
    await this.releaseIntersectEvents(accountId, sectionId, productId, startDate, endDate);
  }

  public async checkProductStatus(
    accountId: number,
    sectionId: number,
    productId: number,
    periods: DatePeriod[],
  ): Promise<ProductRentalStatus> {
    const events = (
      await Promise.all(periods.map((period) => this.buildSchedule(accountId, sectionId, period, { productId })))
    ).flat();

    const status = events.some((event) => event.status === RentalScheduleStatus.Rented)
      ? RentalScheduleStatus.Rented
      : events.some((event) => event.status === RentalScheduleStatus.Reserved)
        ? RentalScheduleStatus.Reserved
        : RentalScheduleStatus.Available;

    return new ProductRentalStatus(productId, status, events);
  }

  public async checkProductsStatus(
    accountId: number,
    sectionId: number,
    dto: CheckRentalStatusDto,
  ): Promise<ProductRentalStatus[]> {
    const periods = dto.periods.map((p) => DatePeriod.fromDto(p));

    return Promise.all(
      dto.productIds.map((productId) => this.checkProductStatus(accountId, sectionId, productId, periods)),
    );
  }

  private async buildSchedule(
    accountId: number,
    sectionId: number,
    period: DatePeriod,
    filter?: { productId?: number | number[] },
  ): Promise<RentalEvent[]> {
    const qb = this.createQueryBuilder(accountId, sectionId, filter);

    const inners = await this.getInnerEvents(qb, period.from, period.to);
    const outers = await this.getOuterEvents(qb, period.from, period.to);
    const [lefts, rights] = await this.getIntersectEvents(qb, period.from, period.to);

    return [...outers, ...lefts, ...inners, ...rights]
      .filter((r) => !!r)
      .sort((a, b) => DateUtil.sort(a.startDate, b.startDate));
  }

  private async releaseProducts(accountId: number, order: RentalOrder): Promise<void> {
    await this.repository.delete({
      accountId,
      sectionId: order.sectionId,
      orderItemId: In(order.items.map((item) => item.id)),
    });
  }
  private async releaseProductsFromDate(accountId: number, order: RentalOrder, date: Date): Promise<void> {
    const itemIds = order.items.map((i) => i.id);

    // release all future events
    await this.repository
      .createQueryBuilder()
      .delete()
      .where('account_id = :accountId', { accountId })
      .andWhere('section_id = :sectionId', { sectionId: order.sectionId })
      .andWhere('order_item_id IN (:...itemIds)', { itemIds })
      .andWhere('start_date > :date', { date })
      .execute();

    // release intersect events
    const events = await this.repository
      .createQueryBuilder()
      .where('account_id = :accountId', { accountId })
      .andWhere('section_id = :sectionId', { sectionId: order.sectionId })
      .andWhere('order_item_id IN (:...itemIds)', { itemIds })
      .andWhere('start_date < :start_date', { start_date: date })
      .andWhere('end_date > :end_date', { end_date: date })
      .getMany();
    for (const event of events) {
      event.endDate = date;
      await this.repository.save(event);
    }
  }
  private async blockProducts(accountId: number, order: RentalOrder, status: RentalScheduleStatus): Promise<void> {
    for (const item of order.items) {
      await this.repository.save(
        order.periods.map(
          (period) =>
            new RentalEvent(
              accountId,
              order.sectionId,
              item.productId,
              item.id,
              period.startDate,
              period.endDate,
              status,
            ),
        ),
      );
    }
  }

  private async releaseInnerEvents(
    accountId: number,
    sectionId: number,
    productId: number,
    startDate: Date,
    endDate: Date,
  ) {
    await this.repository.delete({
      accountId,
      sectionId,
      productId,
      startDate: MoreThanOrEqual(startDate),
      endDate: LessThanOrEqual(endDate),
    });
  }
  private async splitOuterEvent(
    accountId: number,
    sectionId: number,
    productId: number,
    startDate: Date,
    endDate: Date,
  ) {
    const qb = this.createQueryBuilder(accountId, sectionId, { productId });

    const outers = await this.getOuterEvents(qb, startDate, endDate);
    for (const outer of outers) {
      await this.repository.save(
        new RentalEvent(accountId, sectionId, productId, outer.orderItemId, outer.startDate, startDate, outer.status),
      );
      await this.repository.save(
        new RentalEvent(accountId, sectionId, productId, outer.orderItemId, endDate, outer.endDate, outer.status),
      );
      await this.repository.delete(outer.id);
    }
  }
  private async releaseIntersectEvents(
    accountId: number,
    sectionId: number,
    productId: number,
    startDate: Date,
    endDate: Date,
  ) {
    const qb = this.createQueryBuilder(accountId, sectionId, { productId });

    const [lefts, rights] = await this.getIntersectEvents(qb, startDate, endDate);
    if (lefts?.length > 0) {
      lefts.forEach((left) => left.ensureDates(left.startDate, startDate));
      await this.repository.save(lefts);
    }
    if (rights?.length > 0) {
      rights.forEach((right) => right.ensureDates(endDate, right.endDate));
      await this.repository.save(rights);
    }
  }

  private createQueryBuilder(
    accountId: number,
    sectionId: number,
    filter?: { productId?: number | number[] },
  ): SelectQueryBuilder<RentalEvent> {
    const qb = this.repository
      .createQueryBuilder()
      .where('account_id = :accountId', { accountId })
      .andWhere('section_id = :sectionId', { sectionId });

    if (filter?.productId) {
      if (Array.isArray(filter.productId)) {
        qb.andWhere('product_id IN (:...productIds)', { productIds: filter.productId });
      } else {
        qb.andWhere('product_id = :productId', { productId: filter.productId });
      }
    }

    return qb;
  }

  private async getInnerEvents(
    qb: SelectQueryBuilder<RentalEvent>,
    startDate: Date,
    endDate: Date,
  ): Promise<RentalEvent[]> {
    return await qb
      .clone()
      .andWhere('start_date >= :startDate', { startDate: startDate })
      .andWhere('end_date <= :endDate', { endDate: endDate })
      .getMany();
  }
  private async getOuterEvents(
    qb: SelectQueryBuilder<RentalEvent>,
    startDate: Date,
    endDate: Date,
  ): Promise<RentalEvent[]> {
    return await qb
      .clone()
      .andWhere('start_date < :startDate', { startDate: startDate })
      .andWhere('end_date > :endDate', { endDate: endDate })
      .getMany();
  }
  private async getIntersectEvents(qb: SelectQueryBuilder<RentalEvent>, startDate: Date, endDate: Date) {
    const lefts = await qb
      .clone()
      .andWhere('start_date < :startDate1', { startDate1: startDate })
      .andWhere('end_date >= :startDate2', { startDate2: startDate })
      .andWhere('end_date <= :endDate', { endDate: endDate })
      .getMany();

    const rights = await qb
      .clone()
      .andWhere('start_date >= :startDate', { startDate: startDate })
      .andWhere('start_date <= :endDate1', { endDate1: endDate })
      .andWhere('end_date > :endDate2', { endDate2: endDate })
      .getMany();

    return [lefts, rights];
  }
}
