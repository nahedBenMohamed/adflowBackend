import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { NotFoundError } from '@/common';

import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { CrmEventType, EntityPriceUpdateEvent } from '@/CRM/common';

import { ProductOrderCreatedEvent, ProductOrderEvent, ProductsEventType } from '../../common';

import { OrderStatusCode } from '../../order-status/enums/order-status-code.enum';
import { OrderStatusService } from '../../order-status/order-status.service';
import { ReservationService } from '../../reservation/reservation.service';
import { ShipmentService } from '../../shipment/shipment.service';
import { WarehouseService } from '../../warehouse/warehouse.service';

import { ExpandableField } from '../types/expandable-field';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { Order } from '../entities/order.entity';
import { OrderHelper } from '../helper/order.helper';
import { OrderItemService } from './order-item.service';

interface FindFilter {
  sectionId?: number;
  warehouseId?: number | number[];
  withoutWarehouse?: boolean;
  orderId?: number | number[];
  entityId?: number;
  statusId?: { include?: number[]; exclude?: number[] };
}
interface FindOptions {
  expand?: ExpandableField[];
}
interface CancelOptions {
  returnStocks?: boolean;
}
type ProcessOptions = { processShipments?: boolean } & CancelOptions;
type DeleteOptions = { newWarehouseId?: number } & CancelOptions;

@Injectable()
export class OrderService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
    private readonly authService: AuthorizationService,
    private readonly orderItemService: OrderItemService,
    private readonly reservationService: ReservationService,
    private readonly orderStatusService: OrderStatusService,
    @Inject(forwardRef(() => ShipmentService))
    private readonly shipmentService: ShipmentService,
    @Inject(forwardRef(() => WarehouseService))
    private readonly warehouseService: WarehouseService,
  ) {}

  public async create(accountId: number, user: User, sectionId: number, dto: CreateOrderDto): Promise<Order> {
    await this.authService.check({
      action: 'create',
      user,
      authorizable: Order.getAuthorizable(sectionId),
      throwError: true,
    });

    const totalAmount = OrderHelper.calcTotalAmount(dto.items, dto.taxIncluded);
    const orderNumber = await this.getOrderNumber(sectionId, dto.entityId);
    const order = await this.repository.save(
      Order.fromDto(accountId, sectionId, orderNumber, user.id, totalAmount, dto),
    );
    this.eventEmitter.emit(
      ProductsEventType.ProductOrderCreated,
      new ProductOrderCreatedEvent({
        accountId,
        entityId: order.entityId,
        orderId: order.id,
        createdAt: order.createdAt.toISOString(),
      }),
    );

    if (dto.items) {
      await this.orderItemService.createMany(accountId, order.id, dto.items);
      order.items = await this.orderItemService.getForOrder(accountId, sectionId, order.id);
    }

    if (order.statusId) {
      await this.processOrderStatus(accountId, sectionId, order.statusId, order, { processShipments: true });
    }
    order.shipments = await this.shipmentService.findMany({
      accountId,
      user,
      filter: { sectionId, orderId: order.id },
    });

    this.updateEntityValue(accountId, order.entityId);

    return order;
  }

  public async findOne(
    accountId: number,
    user: User | null,
    filter: FindFilter,
    options?: FindOptions,
  ): Promise<Order> {
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
      await this.authService.check({ action: 'view', user, authorizable: order, throwError: true });
    }
    return order && options?.expand ? await this.expandOne(accountId, user, order, options.expand) : order;
  }
  public async findMany(
    accountId: number,
    user: User | null,
    filter: FindFilter,
    options?: FindOptions,
  ): Promise<Order[]> {
    if (user) {
      const warehouses = await this.warehouseService.findMany({
        user,
        filter: { accountId, sectionId: filter.sectionId, warehouseId: filter.warehouseId, onlyAvailable: true },
      });
      filter.withoutWarehouse = !filter.warehouseId;
      filter.warehouseId = warehouses?.length ? warehouses.map((w) => w.id) : undefined;
    }

    const orders = await this.createQb(accountId, filter, true).getMany();
    const checkedOrders: Order[] = [];
    if (user) {
      for (const order of orders) {
        if (await this.authService.check({ action: 'view', user, authorizable: order })) {
          checkedOrders.push(order);
        }
      }
    } else {
      checkedOrders.push(...orders);
    }
    return checkedOrders && options?.expand
      ? await this.expandMany(accountId, user, checkedOrders, options.expand)
      : checkedOrders;
  }

  public async update(
    accountId: number,
    user: User,
    sectionId: number,
    orderId: number,
    dto: UpdateOrderDto,
    returnStocks?: boolean,
  ): Promise<Order> {
    const order = await this.findOne(accountId, null, { sectionId, orderId });
    if (!order) {
      throw NotFoundError.withId(Order, orderId);
    }

    await this.authService.check({ action: 'edit', user, authorizable: order, throwError: true });

    const prevStatusId = order.statusId;
    const totalAmount = OrderHelper.calcTotalAmount(dto.items, dto.taxIncluded);

    await this.repository.save(order.updateFromDto(totalAmount, dto));

    if (dto.items) {
      await this.orderItemService.updateForOrder(accountId, orderId, dto.items);
      order.items = await this.orderItemService.getForOrder(accountId, sectionId, order.id);
    }

    if (order.statusId && order.statusId !== prevStatusId) {
      await this.processOrderStatus(accountId, sectionId, order.statusId, order, {
        processShipments: true,
        returnStocks,
      });
    }
    order.shipments = await this.shipmentService.findMany({
      accountId,
      user,
      filter: { sectionId, orderId: order.id },
    });

    this.updateEntityValue(accountId, order.entityId);

    return order;
  }

  public async processShipmentStatusChanged({
    accountId,
    sectionId,
    orderId,
    statusId,
  }: {
    accountId: number;
    sectionId: number;
    orderId: number;
    statusId: number;
  }): Promise<void> {
    const order = await this.findOne(accountId, null, { sectionId, orderId });
    if (order && statusId !== order.statusId) {
      order.statusId = statusId;
      await this.repository.save(order);

      order.items = await this.orderItemService.getForOrder(accountId, sectionId, order.id);
      await this.processOrderStatus(accountId, sectionId, statusId, order);
      this.updateEntityValue(accountId, order.entityId);
    }
  }

  public async checkCancelOrders() {
    const orders = await this.repository
      .createQueryBuilder('o')
      .leftJoin('order_status', 'os', 'os.id = o.status_id')
      .where('o.cancel_after IS NOT NULL')
      .andWhere('os.code = :code', { code: OrderStatusCode.Reserved })
      .andWhere(`o.updated_at + (o.cancel_after * INTERVAL '1 hour') < now()`)
      .getMany();

    orders.forEach(async (order) => {
      const status = await this.orderStatusService.findOne(order.accountId, { code: OrderStatusCode.Cancelled });
      if (status) {
        order.statusId = status.id;
        await this.repository.save(order);

        await this.processOrderStatus(order.accountId, order.sectionId, order.statusId, order, {
          processShipments: true,
          returnStocks: true,
        });
      }
    });
  }

  public async delete(accountId: number, filter: FindFilter, options?: DeleteOptions) {
    await this.reservationService.delete(accountId, filter, options);
    await this.shipmentService.delete(accountId, filter, options);

    const qb = this.createQb(accountId, filter);
    if (options?.newWarehouseId) {
      await qb.update({ warehouseId: options.newWarehouseId }).execute();
    } else {
      const orders = await qb.clone().getMany();
      await qb.clone().delete().execute();
      for (const order of orders) {
        this.updateEntityValue(accountId, order.entityId);
        this.eventEmitter.emit(
          ProductsEventType.ProductOrderDeleted,
          new ProductOrderEvent({ accountId: order.accountId, entityId: order.entityId, orderId: order.id }),
        );
      }
    }
  }

  private createQb(accountId: number, filter: FindFilter, ordered = false) {
    const qb = this.repository.createQueryBuilder('orders').where('orders.account_id = :accountId', { accountId });
    if (filter.sectionId) {
      qb.andWhere('orders.section_id = :sectionId', { sectionId: filter.sectionId });
    }
    if (filter.warehouseId) {
      qb.andWhere(
        new Brackets((qbW) => {
          if (Array.isArray(filter.warehouseId)) {
            qbW.andWhere('orders.warehouse_id IN (:...warehouseIds)', { warehouseIds: filter.warehouseId });
          } else {
            qbW.andWhere('orders.warehouse_id = :warehouseId', { warehouseId: filter.warehouseId });
          }
          if (filter.withoutWarehouse) {
            qbW.orWhere('orders.warehouse_id IS NULL');
          }
        }),
      );
    }
    if (filter.orderId) {
      if (Array.isArray(filter.orderId)) {
        qb.andWhere('orders.id IN (:...orderIds)', { orderIds: filter.orderId });
      } else {
        qb.andWhere('orders.id = :orderId', { orderId: filter.orderId });
      }
    }
    if (filter.entityId) {
      qb.andWhere('orders.entity_id = :entityId', { entityId: filter.entityId });
    }
    if (filter.statusId) {
      if (filter.statusId.include) {
        qb.andWhere('orders.status_id IN (:...statusIds)', { statusIds: filter.statusId.include });
      }
      if (filter.statusId.exclude) {
        qb.andWhere(
          new Brackets((qb) => {
            qb.where('orders.status_id NOT IN (:...statusIds)', { statusIds: filter.statusId.exclude }).orWhere(
              'orders.status_id IS NULL',
            );
          }),
        );
      }
    }
    if (ordered) {
      qb.orderBy('orders.created_at', 'DESC');
    }
    return qb;
  }

  private async expandOne(
    accountId: number,
    user: User | null,
    order: Order,
    expand: ExpandableField[],
  ): Promise<Order> {
    if (expand.includes('items')) {
      order.items = await this.orderItemService.getForOrder(accountId, order.sectionId, order.id);
    }
    if (expand.includes('shipments') || expand.includes('shippedAt')) {
      order.shipments = await this.shipmentService.findMany({
        accountId,
        user,
        filter: { sectionId: order.sectionId, orderId: order.id },
      });
    }
    return order;
  }
  private async expandMany(
    accountId: number,
    user: User | null,
    orders: Order[],
    expand: ExpandableField[],
  ): Promise<Order[]> {
    return await Promise.all(orders.map((order) => this.expandOne(accountId, user, order, expand)));
  }

  private async processOrderStatus(
    accountId: number,
    sectionId: number,
    statusId: number,
    order: Order,
    options?: ProcessOptions,
  ): Promise<void> {
    const status = await this.orderStatusService.findOne(accountId, { statusId });
    if ([OrderStatusCode.Shipped, OrderStatusCode.Cancelled, OrderStatusCode.Returned].includes(status.code)) {
      await this.reservationService.delete(accountId, { orderId: order.id });
    }
    if (options?.processShipments) {
      await this.shipmentService.processOrder(accountId, sectionId, order, status, options);
    }
  }

  private async getOrderNumber(sectionId: number, entityId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('o')
      .select('MAX(o.order_number)', 'order_number')
      .where('o.entity_id = :entityId', { entityId })
      .andWhere('o.section_id = :sectionId', { sectionId })
      .getRawOne();

    return Number(result?.order_number ?? 0) + 1;
  }

  private async updateEntityValue(accountId: number, entityId: number) {
    const cancelledStatus = await this.orderStatusService.findOne(accountId, { code: OrderStatusCode.Cancelled });
    const orders = await this.findMany(accountId, null, {
      entityId,
      statusId: { exclude: cancelledStatus ? [cancelledStatus.id] : undefined },
    });
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    this.eventEmitter.emit(
      CrmEventType.EntityPriceUpdate,
      new EntityPriceUpdateEvent({ accountId, entityId, price: totalAmount }),
    );
  }
}
