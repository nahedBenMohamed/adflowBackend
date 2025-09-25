import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ProductService } from '../../product/product.service';
import { ReservationService } from '../../reservation/reservation.service';

import { OrderItemDto } from '../dto/order-item.dto';
import { OrderItem } from '../entities/order-item.entity';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly repository: Repository<OrderItem>,
    private readonly reservationService: ReservationService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
  ) {}

  public async createMany(accountId: number, orderId: number, dtos: OrderItemDto[]): Promise<OrderItem[]> {
    return await Promise.all(
      dtos.map(async (dto) => {
        const item = await this.repository.save(OrderItem.fromDto(accountId, orderId, dto));

        item.reservations = await this.reservationService.create(
          accountId,
          orderId,
          item.id,
          item.productId,
          dto.reservations ?? [],
        );

        return item;
      }),
    );
  }

  public async getForOrder(accountId: number, sectionId: number, orderId: number): Promise<OrderItem[]> {
    const items = await this.repository.findBy({ orderId });
    for (const item of items) {
      item.product = await this.productService.findById(accountId, sectionId, item.productId);
      item.reservations = await this.reservationService.findMany(accountId, {
        orderId,
        orderItemId: item.id,
      });
    }
    return items;
  }

  public async updateForOrder(accountId: number, orderId: number, dtos: OrderItemDto[]): Promise<void> {
    const currentItems = await this.repository.findBy({ accountId, orderId });
    const currentItemIds = currentItems.map((item) => item.id);

    const createdDtos = dtos.filter((dto) => !currentItemIds.includes(dto.id));
    const updatedDtos = dtos.filter((dto) => currentItemIds.includes(dto.id));
    const deletedItems = currentItems.filter((item) => !dtos.some((dto) => dto.id === item.id));

    await this.createMany(accountId, orderId, createdDtos);
    await this.updateItems(accountId, orderId, currentItems, updatedDtos);
    await this.repository.delete({ accountId, id: In(deletedItems.map((item) => item.id)) });
  }

  private async updateItems(
    accountId: number,
    orderId: number,
    orderItems: OrderItem[],
    dtos: OrderItemDto[],
  ): Promise<void> {
    await Promise.all(
      dtos.map(async (dto) => {
        const orderItem = orderItems.find((item) => item.id === dto.id);
        if (orderItem) {
          await this.repository.save(orderItem.update(dto));
          await this.reservationService.create(accountId, orderId, orderItem.id, orderItem.productId, dto.reservations);
        }
      }),
    );
  }
}
