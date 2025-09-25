import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';

import { DateUtil, NotFoundError, PagingQuery } from '@/common';

import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { EntityInfoService } from '@/modules/entity/entity-info/entity-info.service';

import { ProductsEventType, ShipmentDeletedEvent, ShipmentCreatedEvent, ShipmentStatusChangedEvent } from '../common';

import { Order, OrderItem } from '../order/entities';
import { OrderStatusCode } from '../order-status/enums';
import { OrderStatus } from '../order-status/entities';
import { OrderStatusService } from '../order-status/order-status.service';
import { ProductStockService } from '../product-stock/product-stock.service';
import { WarehouseService } from '../warehouse/warehouse.service';

import { Shipment, ShipmentItem } from './entities';
import { ShipmentResult } from './types';

interface FindFilter {
  sectionId?: number;
  warehouseId?: number | number[];
  orderId?: number | number[];
  entityId?: number;
  shipmentId?: number | number[];
}
interface CancelOptions {
  returnStocks?: boolean;
}
type DeleteOptions = { newWarehouseId?: number } & CancelOptions;

@Injectable()
export class ShipmentService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Shipment)
    private readonly repository: Repository<Shipment>,
    @InjectRepository(ShipmentItem)
    private readonly itemRepository: Repository<ShipmentItem>,
    private readonly authService: AuthorizationService,
    private readonly orderStatusService: OrderStatusService,
    private readonly entityInfoService: EntityInfoService,
    @Inject(forwardRef(() => ProductStockService))
    private readonly stockService: ProductStockService,
    @Inject(forwardRef(() => WarehouseService))
    private readonly warehouseService: WarehouseService,
  ) {}

  public async findOne({ accountId, user, filter }: { accountId: number; user: User | null; filter: FindFilter }) {
    const shipments = await this.getAuthorizedShipments(accountId, user, filter);
    const shipment = shipments[0];
    if (!shipment) return null;
    shipment.entityInfo = await this.entityInfoService.findOne({
      accountId: shipment.accountId,
      user,
      entityId: shipment.entityId,
    });
    return shipment;
  }

  public async findMany({ accountId, user, filter }: { accountId: number; user: User | null; filter: FindFilter }) {
    const shipments = await this.getAuthorizedShipments(accountId, user, filter);
    await Promise.all(
      shipments.map(async (shipment) => {
        shipment.entityInfo = await this.entityInfoService.findOne({
          accountId: shipment.accountId,
          user,
          entityId: shipment.entityId,
        });
      }),
    );
    return shipments;
  }

  private async getAuthorizedShipments(accountId: number, user: User | null, filter: FindFilter) {
    if (user) {
      const warehouses = await this.warehouseService.findMany({
        user,
        filter: { accountId, sectionId: filter.sectionId, warehouseId: filter.warehouseId, onlyAvailable: true },
      });
      filter.warehouseId = warehouses?.length ? warehouses.map((w) => w.id) : undefined;
    }
    const shipments = await this.createQb(accountId, filter, true).getMany();
    return user
      ? shipments.filter(
          async (shipment) => await this.authService.check({ action: 'view', user, authorizable: shipment }),
        )
      : shipments;
  }

  public async getShipments({
    accountId,
    user,
    sectionId,
    orderId,
    paging,
  }: {
    accountId: number;
    user: User;
    sectionId: number;
    orderId?: number;
    paging: PagingQuery;
  }): Promise<ShipmentResult> {
    await this.authService.check({
      action: 'view',
      user,
      authorizable: Shipment.getAuthorizable(sectionId),
      throwError: true,
    });

    const filter: FindFilter = { sectionId, orderId };
    if (user) {
      const warehouses = await this.warehouseService.findMany({
        user,
        filter: { accountId, sectionId, onlyAvailable: true },
      });
      filter.warehouseId = warehouses?.length ? warehouses.map((w) => w.id) : undefined;
    }

    const qb = this.createQb(accountId, filter, true)
      .orderBy('shipment.created_at', 'DESC')
      .addOrderBy('shipment.id', 'DESC')
      .limit(paging.take)
      .offset(paging.skip);

    const [shipments, total] = await qb.getManyAndCount();

    await Promise.all(
      shipments.map(async (shipment) => {
        shipment.entityInfo = await this.entityInfoService.findOne({
          accountId: shipment.accountId,
          user,
          entityId: shipment.entityId,
        });
      }),
    );

    return new ShipmentResult(shipments, paging.skip, total);
  }

  public async changeStatus(
    accountId: number,
    user: User,
    sectionId: number,
    shipmentId: number,
    statusId: number,
    options?: CancelOptions,
  ): Promise<Shipment> {
    const shipment = await this.findOne({ accountId, user, filter: { sectionId, shipmentId } });
    if (!shipment) {
      throw NotFoundError.withId(Shipment, shipmentId);
    }

    await this.authService.check({ action: 'edit', user, authorizable: shipment, throwError: true });

    if (shipment.statusId !== statusId) {
      const status = await this.orderStatusService.findOne(accountId, { statusId });
      await this.processShipment(accountId, sectionId, shipment, status, options);
    }

    return shipment;
  }

  public async delete(accountId: number, filter: FindFilter, options?: DeleteOptions) {
    if (options?.newWarehouseId) {
      await this.createQb(accountId, filter).update({ warehouseId: options.newWarehouseId }).execute();
    } else {
      const shipments = await this.createQb(accountId, filter, true).getMany();
      if (options?.returnStocks) {
        await Promise.all(
          shipments.map(async (shipment) => {
            const status = await this.orderStatusService.findOne(accountId, { statusId: shipment.statusId });
            if (status.code === OrderStatusCode.Shipped) {
              await this.increaseStocks({ accountId, shipment });
            }
          }),
        );
      }
      await this.createQb(accountId, filter).delete().execute();
      shipments.forEach((shipment) =>
        this.eventEmitter.emit(
          ProductsEventType.ShipmentDeleted,
          new ShipmentDeletedEvent({
            accountId,
            sectionId: shipment.sectionId,
            orderId: shipment.orderId,
            shipmentId: shipment.id,
            entityId: shipment.entityId,
          }),
        ),
      );
    }
  }

  public async processOrder(
    accountId: number,
    sectionId: number,
    order: Order,
    status: OrderStatus,
    options?: CancelOptions,
  ) {
    if (status.code === OrderStatusCode.SentForShipment) {
      await this.createForOrder(accountId, sectionId, order);
    } else {
      await this.processOrderShipments(accountId, sectionId, order.id, status, options);
    }
  }

  private createQb(accountId: number, filter: FindFilter, includeItems = false) {
    const qb = this.repository.createQueryBuilder('shipment').where('shipment.account_id = :accountId', { accountId });
    if (includeItems) {
      qb.leftJoinAndMapMany('shipment.items', ShipmentItem, 'shipment_item', 'shipment_item.shipment_id = shipment.id');
    }
    if (filter.sectionId) {
      qb.andWhere('shipment.section_id = :sectionId', { sectionId: filter.sectionId });
    }
    if (filter.warehouseId) {
      if (Array.isArray(filter.warehouseId)) {
        qb.andWhere('shipment.warehouse_id IN (:...warehouseIds)', { warehouseIds: filter.warehouseId });
      } else {
        qb.andWhere('shipment.warehouse_id = :warehouseId', { warehouseId: filter.warehouseId });
      }
    }
    if (filter.orderId) {
      qb.andWhere('shipment.order_id IN (:...orderIds)', {
        orderIds: Array.isArray(filter.orderId) ? filter.orderId : [filter.orderId],
      });
    }
    if (filter.entityId) {
      qb.andWhere('shipment.entity_id = :entityId', { entityId: filter.entityId });
    }
    if (filter.shipmentId) {
      if (Array.isArray(filter.shipmentId)) {
        qb.andWhere('shipment.id IN (:...shipmentIds)', { shipmentIds: filter.shipmentId });
      } else {
        qb.andWhere('shipment.id = :shipmentId', { shipmentId: filter.shipmentId });
      }
    }
    return qb;
  }

  private async createForOrder(accountId: number, sectionId: number, order: Order): Promise<Shipment[]> {
    await this.createQb(accountId, { sectionId, orderId: order.id }).delete().execute();
    const shipments = new Map<number, Shipment>();
    for (const item of order.items) {
      await this.createForOrderItem(accountId, sectionId, order, item, shipments);
    }
    return Array.from(shipments.values());
  }

  private async createForOrderItem(
    accountId: number,
    sectionId: number,
    order: Order,
    orderItem: OrderItem,
    shipments: Map<number, Shipment>,
  ) {
    for (const reservation of orderItem.reservations) {
      if (!shipments.has(reservation.warehouseId)) {
        const shipment = await this.repository.save(
          new Shipment(
            accountId,
            sectionId,
            `Shipment for order #${order.id}`,
            reservation.warehouseId,
            order.entityId,
            order.id,
            order.orderNumber,
            order.statusId,
          ),
        );
        shipments.set(reservation.warehouseId, shipment);
        this.eventEmitter.emit(
          ProductsEventType.ShipmentCreated,
          new ShipmentCreatedEvent({
            accountId,
            sectionId,
            orderId: order.id,
            shipmentId: shipment.id,
            entityId: order.entityId,
            createdAt: shipment.createdAt.toISOString(),
          }),
        );
      }

      await this.itemRepository.save(
        new ShipmentItem(
          accountId,
          shipments.get(reservation.warehouseId).id,
          orderItem.productId,
          reservation.quantity,
        ),
      );
    }
  }

  private async processOrderShipments(
    accountId: number,
    sectionId: number,
    orderId: number,
    status: OrderStatus,
    options?: CancelOptions,
  ) {
    const shipments = await this.findMany({ accountId, user: null, filter: { sectionId, orderId } });
    await Promise.all(
      shipments
        .filter((shipment) => shipment.statusId !== status.id)
        .map((shipment) => this.processShipment(accountId, sectionId, shipment, status, options)),
    );
  }

  private async processShipment(
    accountId: number,
    sectionId: number,
    shipment: Shipment,
    status: OrderStatus,
    options?: CancelOptions,
  ) {
    if (status.code === OrderStatusCode.Shipped) {
      shipment.shippedAt = DateUtil.now();
      await this.reduceStocks({ accountId, shipment });
    } else if ([OrderStatusCode.Returned, OrderStatusCode.Cancelled].includes(status.code)) {
      shipment.shippedAt = null;
      if (options?.returnStocks) {
        await this.increaseStocks({ accountId, shipment });
      }
    }
    shipment.statusId = status.id;
    await this.repository.save(shipment);

    this.eventEmitter.emit(
      ProductsEventType.ShipmentStatusChanged,
      new ShipmentStatusChangedEvent({
        accountId,
        sectionId,
        orderId: shipment.orderId,
        shipmentId: shipment.id,
        statusId: shipment.statusId,
      }),
    );
  }

  private async reduceStocks({ accountId, shipment }: { accountId: number; shipment: Shipment }) {
    await Promise.all(
      shipment.items.map(({ productId, quantity }) =>
        this.stockService.reduce({ accountId, warehouseId: shipment.warehouseId, productId, quantity }),
      ),
    );
  }

  private async increaseStocks({ accountId, shipment }: { accountId: number; shipment: Shipment }) {
    await Promise.all(
      shipment.items.map(({ productId, quantity }) =>
        this.stockService.increase({ accountId, warehouseId: shipment.warehouseId, productId, quantity }),
      ),
    );
  }
}
