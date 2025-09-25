import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReservationDto } from './dto';
import { Reservation } from './entities';

interface FindFilter {
  warehouseId?: number | number[];
  orderId?: number | number[];
  orderItemId?: number;
  productId?: number;
}
interface DeleteOptions {
  newWarehouseId?: number;
}
interface ReservationByWarehouse {
  quantity: number;
  warehouseId: number;
}

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly repository: Repository<Reservation>,
  ) {}

  public async create(
    accountId: number,
    orderId: number,
    orderItemId: number,
    productId: number,
    dtos: ReservationDto[],
  ): Promise<Reservation[]> {
    await this.createQb(accountId, { orderId, orderItemId, productId }).delete().execute();

    const reservations: Reservation[] = [];
    for (const dto of dtos) {
      reservations.push(
        await this.repository.save(Reservation.fromDto(accountId, orderId, orderItemId, productId, dto)),
      );
    }

    return reservations;
  }

  public async findMany(accountId: number, filter: FindFilter): Promise<Reservation[]> {
    return this.createQb(accountId, filter).getMany();
  }

  public async getReservedQuantities(accountId: number, filter: FindFilter): Promise<ReservationByWarehouse[]> {
    return this.createQb(accountId, filter)
      .select('reservation.warehouse_id', 'warehouseId')
      .addSelect('sum(reservation.quantity)', 'quantity')
      .groupBy('reservation.warehouse_id')
      .getRawMany<ReservationByWarehouse>();
  }

  public async delete(accountId: number, filter: FindFilter, options?: DeleteOptions) {
    const qb = this.createQb(accountId, filter);
    if (options?.newWarehouseId) {
      await qb.update({ warehouseId: options.newWarehouseId }).execute();
    } else {
      await qb.delete().execute();
    }
  }

  private createQb(accountId: number, filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('reservation')
      .where('reservation.account_id = :accountId', { accountId });
    if (filter.warehouseId) {
      if (Array.isArray(filter.warehouseId)) {
        qb.andWhere('reservation.warehouse_id IN (:...warehouseIds)', { warehouseIds: filter.warehouseId });
      } else {
        qb.andWhere('reservation.warehouse_id = :warehouseId', { warehouseId: filter.warehouseId });
      }
    }
    if (filter.orderId) {
      qb.andWhere('reservation.order_id IN (:...orderIds)', {
        orderIds: Array.isArray(filter.orderId) ? filter.orderId : [filter.orderId],
      });
    }
    if (filter.orderItemId) {
      qb.andWhere('reservation.order_item_id = :orderItemId', { orderItemId: filter.orderItemId });
    }
    if (filter.productId) {
      qb.andWhere('reservation.product_id = :productId', { productId: filter.productId });
    }
    return qb;
  }
}
