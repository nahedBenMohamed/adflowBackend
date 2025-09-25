import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';

import { Product } from '../product/entities/product.entity';
import { ReservationService } from '../reservation/reservation.service';
import { WarehouseService } from '../warehouse/warehouse.service';

import { CreateProductStockDto, UpdateProductStockDto } from './dto';
import { ProductStock } from './entities';

interface FindFilter {
  accountId: number;
  productId: number;
  warehouseId?: number | number[];
}

@Injectable()
export class ProductStockService {
  constructor(
    @InjectRepository(ProductStock)
    private readonly repository: Repository<ProductStock>,
    private readonly authService: AuthorizationService,
    private readonly reservationService: ReservationService,
    @Inject(forwardRef(() => WarehouseService))
    private readonly warehouseService: WarehouseService,
  ) {}

  public async create({
    accountId,
    productId,
    dtos,
  }: {
    accountId: number;
    productId: number;
    dtos: CreateProductStockDto[];
  }): Promise<ProductStock[]> {
    return await this.repository.save(
      dtos.map((dto) => new ProductStock(accountId, productId, dto.warehouseId, dto.stockQuantity)),
    );
  }

  public async findMany({ user, filter }: { user: User | null; filter: FindFilter }): Promise<ProductStock[]> {
    if (user) {
      const warehouses = await this.warehouseService.findMany({
        user,
        filter: { accountId: filter.accountId, warehouseId: filter.warehouseId, onlyAvailable: true },
      });
      filter.warehouseId = warehouses?.length ? warehouses.map((w) => w.id) : undefined;
    }
    const [stocks, reserved] = await Promise.all([
      this.createFindQb(filter).getMany(),
      this.reservationService.getReservedQuantities(filter.accountId, {
        productId: filter.productId,
        warehouseId: filter.warehouseId,
      }),
    ]);
    stocks.forEach(
      (stock) => (stock.reserved = reserved.find((r) => r.warehouseId === stock.warehouseId)?.quantity ?? 0),
    );

    return stocks;
  }

  public async update({
    accountId,
    user,
    sectionId,
    productId,
    dtos,
  }: {
    accountId: number;
    user: User;
    sectionId: number;
    productId: number;
    dtos: UpdateProductStockDto[];
  }): Promise<ProductStock[]> {
    await this.authService.check({
      action: 'edit',
      user,
      authorizable: Product.getAuthorizable(sectionId),
      throwError: true,
    });

    const deleteStocks = dtos.filter((dto) => dto.stockQuantity === null);
    if (deleteStocks.length > 0) {
      await this.repository.delete({ productId, warehouseId: In(deleteStocks.map((ds) => ds.warehouseId)) });
    }

    const updateStocks = dtos.filter((dto) => dto.stockQuantity !== null);
    if (updateStocks.length > 0) {
      await this.repository.save(
        updateStocks.map((dto) => new ProductStock(accountId, productId, dto.warehouseId, dto.stockQuantity)),
      );
    }

    return await this.findMany({ user, filter: { accountId, productId } });
  }

  public async delete({
    accountId,
    warehouseId,
    newWarehouseId,
  }: {
    accountId: number;
    warehouseId: number;
    newWarehouseId?: number;
  }): Promise<void> {
    if (newWarehouseId) {
      const stocks = await this.repository.findBy({ accountId, warehouseId });
      for (const stock of stocks) {
        const otherStock = await this.repository.findOneBy({
          accountId,
          warehouseId: newWarehouseId,
          productId: stock.productId,
        });

        if (otherStock) {
          otherStock.stockQuantity += stock.stockQuantity;
          await this.repository.save(otherStock);
        } else {
          await this.repository.update(
            { productId: stock.productId, warehouseId: stock.warehouseId },
            { warehouseId: newWarehouseId },
          );
        }
      }
    }

    await this.repository.delete({ accountId, warehouseId });
  }

  public async reduce({
    accountId,
    warehouseId,
    productId,
    quantity,
  }: {
    accountId: number;
    warehouseId: number;
    productId: number;
    quantity: number;
  }): Promise<ProductStock | null> {
    const stock = await this.repository.findOneBy({ accountId, warehouseId, productId });
    if (stock) {
      stock.stockQuantity -= quantity;
      await this.repository.save(stock);
    }
    return stock;
  }

  public async increase({
    accountId,
    warehouseId,
    productId,
    quantity,
  }: {
    accountId: number;
    warehouseId: number;
    productId: number;
    quantity: number;
  }): Promise<ProductStock | null> {
    const stock = await this.repository.findOneBy({ accountId, warehouseId, productId });
    if (stock) {
      stock.stockQuantity += quantity;
      await this.repository.save(stock);
    }
    return stock;
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('stock')
      .where('stock.account_id = :accountId', { accountId: filter.accountId })
      .andWhere('stock.product_id = :productId', { productId: filter.productId });
    if (filter.warehouseId) {
      if (Array.isArray(filter.warehouseId)) {
        qb.andWhere('stock.warehouse_id IN (:...warehouseIds)', { warehouseIds: filter.warehouseId });
      } else {
        qb.andWhere('stock.warehouse_id = :warehouseId', { warehouseId: filter.warehouseId });
      }
    }
    return qb;
  }
}
