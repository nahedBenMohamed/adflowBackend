import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ForbiddenError } from '@/common';

import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';

import { OrderService } from '../order/services/order.service';
import { ProductsSection } from '../products-section/entities';
import { ProductStockService } from '../product-stock/product-stock.service';
import { RentalOrderService } from '../rental-order/services/rental-order.service';

import { CreateWarehouseDto, UpdateWarehouseDto } from './dto';
import { Warehouse } from './entities';

interface FindFilter {
  accountId: number;
  sectionId?: number;
  warehouseId?: number | number[];
  onlyAvailable?: boolean;
}

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly repository: Repository<Warehouse>,
    private readonly authService: AuthorizationService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    @Inject(forwardRef(() => ProductStockService))
    private readonly stockService: ProductStockService,
    @Inject(forwardRef(() => RentalOrderService))
    private readonly rentalOrderService: RentalOrderService,
  ) {}

  public async create({
    accountId,
    user,
    sectionId,
    dto,
  }: {
    accountId: number;
    user: User;
    sectionId: number;
    dto: CreateWarehouseDto;
  }): Promise<Warehouse> {
    await this.authService.check({
      action: 'create',
      user,
      authorizable: ProductsSection.getAuthorizable(sectionId),
      throwError: true,
    });

    return this.repository.save(Warehouse.fromDto({ accountId, sectionId, createdBy: user.id, dto }));
  }

  public async findOne({ user, filter }: { user: User; filter: FindFilter }): Promise<Warehouse | null> {
    if (filter.sectionId) {
      await this.authService.check({
        action: 'view',
        user,
        authorizable: ProductsSection.getAuthorizable(filter.sectionId),
        throwError: true,
      });
    }

    const warehouse = await this.createFindQb(filter).getOne();
    if (warehouse) warehouse.userRights = await this.authService.getUserRights({ user, authorizable: warehouse });

    return filter.onlyAvailable && !warehouse.userRights.canView ? null : warehouse;
  }
  public async findMany({ user, filter }: { user: User; filter: FindFilter }): Promise<Warehouse[]> {
    if (filter.sectionId) {
      await this.authService.check({
        action: 'view',
        user,
        authorizable: ProductsSection.getAuthorizable(filter.sectionId),
        throwError: true,
      });
    }

    const warehouses = await this.createFindQb(filter).orderBy({ name: 'ASC' }).getMany();
    await Promise.all(
      warehouses.map(
        async (warehouse) =>
          (warehouse.userRights = await this.authService.getUserRights({ user, authorizable: warehouse })),
      ),
    );

    return filter.onlyAvailable ? warehouses.filter((warehouse) => warehouse.userRights.canView) : warehouses;
  }

  public async update({
    accountId,
    user,
    sectionId,
    warehouseId,
    dto,
  }: {
    accountId: number;
    user: User;
    sectionId: number;
    warehouseId: number;
    dto: UpdateWarehouseDto;
  }): Promise<Warehouse> {
    await this.authService.check({
      action: 'edit',
      user,
      authorizable: ProductsSection.getAuthorizable(sectionId),
      throwError: true,
    });

    const warehouse = await this.findOne({ user, filter: { accountId, sectionId, warehouseId } });
    if (!warehouse.userRights.canEdit) {
      throw new ForbiddenError();
    }

    await this.repository.save(warehouse.update(dto));

    return warehouse;
  }

  public async delete({
    accountId,
    user,
    sectionId,
    warehouseId,
    newWarehouseId,
  }: {
    accountId: number;
    user: User;
    sectionId: number;
    warehouseId: number;
    newWarehouseId?: number;
  }): Promise<void> {
    await this.authService.check({
      action: 'delete',
      user,
      authorizable: ProductsSection.getAuthorizable(sectionId),
      throwError: true,
    });

    const warehouse = await this.findOne({ user, filter: { accountId, sectionId, warehouseId } });
    if (!warehouse.userRights.canDelete) {
      throw new ForbiddenError();
    }

    await this.orderService.delete(accountId, { sectionId, warehouseId }, { newWarehouseId });
    await this.stockService.delete({ accountId, warehouseId, newWarehouseId });
    await this.rentalOrderService.delete(accountId, user, { sectionId, warehouseId }, { newWarehouseId });

    await this.repository.delete({ accountId, sectionId, id: warehouseId });
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository.createQueryBuilder().where({ accountId: filter.accountId });
    if (filter.sectionId) qb.andWhere({ sectionId: filter.sectionId });
    if (filter.warehouseId) {
      if (Array.isArray(filter.warehouseId)) {
        qb.andWhere({ id: In(filter.warehouseId) });
      } else {
        qb.andWhere({ id: filter.warehouseId });
      }
    }
    return qb;
  }
}
