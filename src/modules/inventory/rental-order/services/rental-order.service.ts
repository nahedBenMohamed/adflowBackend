import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Brackets, Repository } from 'typeorm';
import Decimal from 'decimal.js';

import { DatePeriodDto, DateUtil, NotFoundError } from '@/common';

import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { EntityInfoService } from '@/modules/entity/entity-info/entity-info.service';
import { CrmEventType, EntityPriceUpdateEvent } from '@/CRM/common';

import { ProductsEventType, RentalOrderCreatedEvent, RentalOrderEvent } from '../../common';
import { RentalScheduleService } from '../../rental-schedule/rental-schedule.service';
import { WarehouseService } from '../../warehouse/warehouse.service';

import { CreateRentalOrderDto, UpdateRentalOrderDto } from '../dto';
import { RentalOrder, RentalOrderItem, RentalOrderPeriod } from '../entities';
import { RentalOrderStatus } from '../enums';
import { RentalOrderItemService } from './rental-order-item.service';

interface FindFilter {
  sectionId?: number;
  warehouseId?: number | number[];
  withoutWarehouse?: boolean;
  orderId?: number | number[];
  entityId?: number | null;
  statuses?: RentalOrderStatus[] | null;
}
interface DeleteOptions {
  newWarehouseId?: number;
  checkPermission?: boolean;
}

@Injectable()
export class RentalOrderService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(RentalOrder)
    private readonly repository: Repository<RentalOrder>,
    @InjectRepository(RentalOrderPeriod)
    private readonly repositoryPeriod: Repository<RentalOrderPeriod>,
    private readonly authService: AuthorizationService,
    private readonly itemsService: RentalOrderItemService,
    @Inject(forwardRef(() => RentalScheduleService))
    private readonly scheduleService: RentalScheduleService,
    private readonly entityInfoService: EntityInfoService,
    @Inject(forwardRef(() => WarehouseService))
    private readonly warehouseService: WarehouseService,
  ) {}

  public async create(
    accountId: number,
    user: User,
    sectionId: number,
    dto: CreateRentalOrderDto,
  ): Promise<RentalOrder> {
    await this.authService.check({
      action: 'create',
      user,
      authorizable: RentalOrder.getAuthorizable(sectionId),
      throwError: true,
    });

    const orderNumber = await this.getOrderNumber(sectionId, dto.entityId);
    const order = await this.repository.save(RentalOrder.fromDto(accountId, sectionId, orderNumber, user.id, dto));
    this.eventEmitter.emit(
      ProductsEventType.RentalOrderCreated,
      new RentalOrderCreatedEvent({
        accountId,
        entityId: order.entityId,
        rentalOrderId: order.id,
        createdAt: order.createdAt.toISOString(),
      }),
    );

    if (dto.periods) {
      order.periods = await this.setRentalPeriods({ accountId, orderId: order.id, dtos: dto.periods });
    }
    if (dto.items) {
      order.items = await this.itemsService.createMany({ accountId, orderId: order.id, dtos: dto.items });
    }

    await this.scheduleService.processOrder(accountId, order);
    order.entityInfo = await this.entityInfoService.findOne({ accountId, user, entityId: order.entityId });

    this.updateEntityPrice({ accountId, entityId: order.entityId });

    return order;
  }

  public async getOne(accountId: number, user: User, sectionId: number | null, orderId: number): Promise<RentalOrder> {
    const order = await this.findOne(accountId, user, { sectionId, orderId });
    if (!order) {
      throw NotFoundError.withId(RentalOrder, orderId);
    }
    await this.authService.check({ action: 'view', user, authorizable: order, throwError: true });

    return order;
  }

  public async findOne(accountId: number, user: User | null, filter?: FindFilter): Promise<RentalOrder> {
    if (user) {
      const warehouses = await this.warehouseService.findMany({
        user,
        filter: { accountId, sectionId: filter.sectionId, warehouseId: filter.warehouseId, onlyAvailable: true },
      });
      filter.withoutWarehouse = !filter.warehouseId;
      filter.warehouseId = warehouses?.length ? warehouses.map((w) => w.id) : undefined;
    }
    const order = await this.createQb(accountId, filter).getOne();
    if (user) {
      order.entityInfo = await this.entityInfoService.findOne({ accountId, user, entityId: order.entityId });
    }

    return order;
  }

  public async findMany(accountId: number, user: User | null, filter: FindFilter): Promise<RentalOrder[]> {
    if (user && filter.sectionId) {
      await this.authService.check({
        action: 'view',
        user,
        authorizable: RentalOrder.getAuthorizable(filter.sectionId),
        throwError: true,
      });
    }

    if (user) {
      const warehouses = await this.warehouseService.findMany({
        user,
        filter: { accountId, sectionId: filter.sectionId, warehouseId: filter.warehouseId, onlyAvailable: true },
      });
      filter.withoutWarehouse = !filter.warehouseId;
      filter.warehouseId = warehouses?.length ? warehouses.map((w) => w.id) : undefined;
    }

    const orders = await this.createQb(accountId, filter).orderBy('rental_order.created_at', 'DESC').getMany();
    if (user) {
      for (const order of orders) {
        order.entityInfo = await this.entityInfoService.findOne({ accountId, user, entityId: order.entityId });
      }
    }

    return orders;
  }

  public async update(
    accountId: number,
    user: User,
    sectionId: number,
    orderId: number,
    dto: UpdateRentalOrderDto,
  ): Promise<RentalOrder> {
    const order = await this.findOne(accountId, user, { sectionId, orderId });
    if (!order) {
      throw NotFoundError.withId(RentalOrder, orderId);
    }
    await this.authService.check({ action: 'edit', user, authorizable: order, throwError: true });

    await this.repository.save(order.update(dto));

    if (dto.periods) {
      order.periods = await this.setRentalPeriods({ accountId, orderId: order.id, dtos: dto.periods });
    }
    if (dto.items) {
      order.items = await this.itemsService.processBatch({
        accountId,
        orderId: order.id,
        items: order.items,
        dtos: dto.items,
      });
    }

    await this.scheduleService.processOrder(accountId, order);
    order.entityInfo = await this.entityInfoService.findOne({ accountId, user, entityId: order.entityId });

    this.updateEntityPrice({ accountId, entityId: order.entityId });

    return order;
  }

  public async changeStatus(
    accountId: number,
    user: User,
    sectionId: number,
    orderId: number,
    status: RentalOrderStatus,
  ): Promise<RentalOrder> {
    const order = await this.findOne(accountId, user, { sectionId, orderId });
    if (!order) {
      throw NotFoundError.withId(RentalOrder, orderId);
    }

    await this.authService.check({ action: 'edit', user, authorizable: order, throwError: true });

    if (status && order.status !== status) {
      order.status = status;
      await this.repository.save(order);
      await this.scheduleService.processOrder(accountId, order);
    }

    this.updateEntityPrice({ accountId, entityId: order.entityId });

    return order;
  }

  public async delete(accountId: number, user: User, filter: FindFilter, options?: DeleteOptions) {
    if (options?.checkPermission && filter.sectionId) {
      await this.authService.check({
        action: 'delete',
        user,
        authorizable: RentalOrder.getAuthorizable(filter.sectionId),
        throwError: true,
      });
    }
    const qb = this.createQb(accountId, filter);
    if (options?.newWarehouseId) {
      await qb.update({ warehouseId: options.newWarehouseId }).execute();
    } else {
      const orders = await qb.clone().getMany();
      await qb.clone().delete().execute();
      for (const order of orders) {
        this.updateEntityPrice({ accountId, entityId: order.entityId });
        this.eventEmitter.emit(
          ProductsEventType.RentalOrderDeleted,
          new RentalOrderEvent({ accountId: order.accountId, entityId: order.entityId, rentalOrderId: order.id }),
        );
      }
    }
  }

  public async getEntityIdsByOrderItemIds(
    orderItemIds: number[],
  ): Promise<{ orderItemId: number; entityId: number }[]> {
    const result = await this.repository
      .createQueryBuilder('rental_order')
      .select('item.id', 'itemId')
      .addSelect('rental_order.entity_id', 'entityId')
      .leftJoin(RentalOrderItem, 'item', 'item.order_id = rental_order.id')
      .where('item.id IN (:...orderItemIds)', { orderItemIds })
      .getRawMany();

    return result.map((r) => ({ orderItemId: Number(r.itemId), entityId: Number(r.entityId) }));
  }

  private createQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('rental_order')
      .where('rental_order.account_id = :accountId', { accountId: accountId })
      .leftJoinAndMapMany('rental_order.items', RentalOrderItem, 'item', 'rental_order.id = item.order_id')
      .leftJoinAndMapMany('rental_order.periods', RentalOrderPeriod, 'period', 'rental_order.id = period.order_id');

    if (filter?.sectionId) {
      qb.andWhere('rental_order.section_id = :sectionId', { sectionId: filter.sectionId });
    }
    if (filter.warehouseId) {
      qb.andWhere(
        new Brackets((qbW) => {
          if (Array.isArray(filter.warehouseId)) {
            qbW.andWhere('rental_order.warehouse_id IN (:...warehouseIds)', { warehouseIds: filter.warehouseId });
          } else {
            qbW.andWhere('rental_order.warehouse_id = :warehouseId', { warehouseId: filter.warehouseId });
          }
          if (filter.withoutWarehouse) {
            qbW.orWhere('rental_order.warehouse_id IS NULL');
          }
        }),
      );
    }
    if (filter?.orderId) {
      qb.andWhere('rental_order.id IN (:...orderIds)', {
        orderIds: Array.isArray(filter.orderId) ? filter.orderId : [filter.orderId],
      });
    }
    if (filter?.entityId) {
      qb.andWhere('rental_order.entity_id = :entityId', { entityId: filter.entityId });
    }
    if (filter?.statuses && filter.statuses.length > 0) {
      qb.andWhere('rental_order.status IN (:...statuses)', { statuses: filter.statuses });
    }

    return qb;
  }

  private async getOrderNumber(sectionId: number, entityId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('ro')
      .select('MAX(ro.order_number)', 'order_number')
      .where('ro.entity_id = :entityId', { entityId })
      .andWhere('ro.section_id = :sectionId', { sectionId })
      .getRawOne();

    return Number(result?.order_number ?? 0) + 1;
  }

  private async updateEntityPrice({ accountId, entityId }: { accountId: number; entityId: number }) {
    const orders = await this.findMany(accountId, null, { entityId });

    const price = orders
      .filter((order) => order.status !== RentalOrderStatus.Cancelled)
      .reduce((sum, order) => sum + this.calculateTotalAmount(order), 0);

    this.eventEmitter.emit(CrmEventType.EntityPriceUpdate, new EntityPriceUpdateEvent({ accountId, entityId, price }));
  }
  private calculateTotalAmount({ items, periods, taxIncluded }: RentalOrder): number {
    const amount = items.reduce((total, item) => {
      return total.plus(this.calculateItemAmount({ item, taxIncluded }));
    }, new Decimal(0));

    return amount.mul(this.calculateRentalLength(periods)).toNumber();
  }
  private calculateItemAmount({ item, taxIncluded }: { item: RentalOrderItem; taxIncluded: boolean }): number {
    let amount = new Decimal(item.unitPrice);
    if (item.discount) {
      amount = amount.sub(amount.mul(new Decimal(item.discount).div(100)));
    }

    return taxIncluded ? amount.toNumber() : amount.add(amount.mul(new Decimal(item.tax).div(100))).toNumber();
  }
  private calculateRentalLength(periods: RentalOrderPeriod[]): number {
    return periods.reduce(
      (length, { startDate, endDate }) => length + DateUtil.diff({ startDate, endDate, unit: 'day' }),
      1,
    );
  }

  private async setRentalPeriods({
    accountId,
    orderId,
    dtos,
  }: {
    accountId: number;
    orderId: number;
    dtos: DatePeriodDto[];
  }): Promise<RentalOrderPeriod[]> {
    await this.repositoryPeriod.delete({ accountId, orderId });

    return await this.repositoryPeriod.save(dtos.map((dto) => RentalOrderPeriod.fromDto(accountId, orderId, dto)));
  }
}
