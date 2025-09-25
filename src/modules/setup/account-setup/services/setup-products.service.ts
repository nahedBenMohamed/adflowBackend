import { Injectable } from '@nestjs/common';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { User } from '@/modules/iam/user/entities/user.entity';
import { StorageService } from '@/modules/storage/storage.service';
import { StorageFile } from '@/modules/storage/types/storage-file';

import { ProductsSectionService } from '@/modules/inventory/products-section/services/products-section.service';
import { RentalIntervalService } from '@/modules/inventory/rental-interval/rental-interval.service';
import { WarehouseService } from '@/modules/inventory/warehouse/warehouse.service';
import { ProductCategoryService } from '@/modules/inventory/product-category/product-category.service';
import { ProductService } from '@/modules/inventory/product/product.service';
import { OrderStatusService } from '@/modules/inventory/order-status/order-status.service';
import { OrderService } from '@/modules/inventory/order/services/order.service';
import { RentalOrderService } from '@/modules/inventory/rental-order/services/rental-order.service';

interface ProductsMaps {
  sectionsMap: Map<number, number>;
  productsMap: Map<number, number>;
  salesOrdersMap: Map<number, number>;
  rentalOrdersMap: Map<number, number>;
}

@Injectable()
export class SetupProductsService {
  constructor(
    private readonly storageService: StorageService,
    private readonly productsSectionService: ProductsSectionService,
    private readonly rentalIntervalService: RentalIntervalService,
    private readonly warehouseService: WarehouseService,
    private readonly productCategoryService: ProductCategoryService,
    private readonly productService: ProductService,
    private readonly orderStatusService: OrderStatusService,
    private readonly orderService: OrderService,
    private readonly rentalOrderService: RentalOrderService,
  ) {}

  public async copyAll(
    rmsAccount: Account,
    rmsOwner: User,
    account: Account,
    owner: User,
    entityTypesMap: Map<number, number>,
    entitiesMap: Map<number, number>,
    sectionIds?: number[],
  ): Promise<ProductsMaps> {
    const sectionsMap = await this.copyProductsSections(
      rmsAccount.id,
      rmsOwner,
      account.id,
      entityTypesMap,
      sectionIds,
    );
    const warehousesMap = await this.copyWarehouses(rmsAccount.id, rmsOwner, account.id, owner, sectionsMap);
    const categoriesMap = await this.copyProductCategories(rmsAccount.id, account.id, owner, sectionsMap);
    const productsMap = await this.copyProducts(
      rmsAccount,
      rmsOwner,
      account,
      owner,
      sectionsMap,
      categoriesMap,
      warehousesMap,
    );
    const orderStatusesMap = await this.copyOrderStatuses(rmsAccount.id, account.id);
    const salesOrdersMap = await this.copySalesOrders(
      rmsAccount.id,
      rmsOwner,
      account.id,
      owner,
      entitiesMap,
      sectionsMap,
      warehousesMap,
      productsMap,
      orderStatusesMap,
    );
    const rentalOrdersMap = await this.copyRentalOrders(
      rmsAccount.id,
      rmsOwner,
      account.id,
      owner,
      entitiesMap,
      sectionsMap,
      warehousesMap,
      productsMap,
    );

    return { sectionsMap, productsMap, salesOrdersMap, rentalOrdersMap };
  }

  private async copyProductsSections(
    rmsAccountId: number,
    rmsOwner: User,
    accountId: number,
    entityTypesMap: Map<number, number>,
    sectionIds?: number[],
  ): Promise<Map<number, number>> {
    const allSections = await this.productsSectionService.getAllFull(rmsAccountId, rmsOwner);
    const rmsSections = sectionIds ? allSections.filter((s) => sectionIds.includes(s.id)) : allSections;

    const sectionsMap = new Map<number, number>();
    for (const rmsSection of rmsSections) {
      const section = await this.productsSectionService.create(accountId, rmsSection);
      sectionsMap.set(rmsSection.id, section.id);

      if (rmsSection.links) {
        const entityTypeIds: number[] = [];
        for (const link of rmsSection.links.filter((l) => entityTypesMap.has(l.entityTypeId))) {
          entityTypeIds.push(entityTypesMap.get(link.entityTypeId));
        }
        if (entityTypeIds.length > 0) {
          await this.productsSectionService.linkEntityTypes(accountId, section.id, entityTypeIds);
        }
      }

      const rmsRentalInterval = await this.rentalIntervalService.findRentalInterval(rmsAccountId, rmsSection.id);
      if (rmsRentalInterval) {
        await this.rentalIntervalService.setRentalInterval(accountId, section.id, {
          type: rmsRentalInterval.type,
          startTime: rmsRentalInterval.startTime,
        });
      }
    }
    return sectionsMap;
  }

  private async copyWarehouses(
    rmsAccountId: number,
    rmsOwner: User,
    accountId: number,
    owner: User,
    sectionsMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const warehousesMap = new Map<number, number>();
    for (const [rmsSectionId, sectionId] of sectionsMap) {
      const rmsWarehouses = await this.warehouseService.findMany({
        user: rmsOwner,
        filter: { accountId: rmsAccountId, sectionId: rmsSectionId },
      });
      for (const rmsWarehouse of rmsWarehouses) {
        const warehouse = await this.warehouseService.create({
          accountId,
          user: owner,
          sectionId,
          dto: { name: rmsWarehouse.name },
        });
        warehousesMap.set(rmsWarehouse.id, warehouse.id);
      }
    }
    return warehousesMap;
  }

  private async copyProductCategories(
    rmsAccountId: number,
    accountId: number,
    owner: User,
    sectionMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const categoriesMap: Map<number, number> = new Map<number, number>();
    for (const [rmsSectionId, sectionId] of sectionMap) {
      const rmsCategories = await this.productCategoryService.getCategoriesFlat(rmsAccountId, rmsSectionId, null);
      for (const rmsCategory of rmsCategories) {
        const category = await this.productCategoryService.create(accountId, owner, sectionId, {
          name: rmsCategory.name,
          parentId: rmsCategory.parentId ? categoriesMap.get(rmsCategory.parentId) : null,
        });
        categoriesMap.set(rmsCategory.id, category.id);
      }
    }
    return categoriesMap;
  }

  private async copyProducts(
    rmsAccount: Account,
    rmsOwner: User,
    account: Account,
    owner: User,
    sectionsMap: Map<number, number>,
    categoriesMap: Map<number, number>,
    warehousesMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const productsMap = new Map<number, number>();

    for (const [rmsSectionId, sectionId] of sectionsMap) {
      const rmsProducts = await this.productService.findManyFull(rmsAccount, rmsOwner, rmsSectionId);
      for (const rmsProduct of rmsProducts) {
        const prices = rmsProduct.prices.map((p) => {
          return { name: p.name, unitPrice: p.unitPrice, currency: p.currency, maxDiscount: p.maxDiscount };
        });
        const stocks = rmsProduct.stocks.map((s) => {
          return { warehouseId: warehousesMap.get(s.warehouseId), stockQuantity: s.stockQuantity };
        });
        const photos: string[] = [];
        const product = await this.productService.create(account, owner, sectionId, {
          name: rmsProduct.name,
          type: rmsProduct.type,
          description: rmsProduct.description,
          sku: rmsProduct.sku,
          unit: rmsProduct.unit,
          tax: rmsProduct.tax,
          categoryId: rmsProduct.categoryId ? categoriesMap.get(rmsProduct.categoryId) : null,
          prices,
          stocks,
          photoFileIds: photos,
        });

        for (const photo of rmsProduct.photoFileLinks) {
          const { file, content } = await this.storageService.getFile({
            fileId: photo.fileId,
            accountId: rmsAccount.id,
          });
          await this.productService.uploadPhotos(account, owner, sectionId, product.id, [
            StorageFile.fromFileInfo(file, Buffer.from(content)),
          ]);
        }

        productsMap.set(rmsProduct.id, product.id);
      }
    }

    return productsMap;
  }

  private async copyOrderStatuses(rmsAccountId: number, accountId: number) {
    const orderStatusesMap = new Map<number, number>();

    const rmsOrderStatuses = await this.orderStatusService.findMany(rmsAccountId);
    for (const rmsOrderStatus of rmsOrderStatuses) {
      const orderStatus = await this.orderStatusService.create(accountId, rmsOrderStatus);
      orderStatusesMap.set(rmsOrderStatus.id, orderStatus.id);
    }

    return orderStatusesMap;
  }

  private async copySalesOrders(
    rmsAccountId: number,
    rmsOwner: User,
    accountId: number,
    owner: User,
    entitiesMap: Map<number, number>,
    sectionsMap: Map<number, number>,
    warehousesMap: Map<number, number>,
    productsMap: Map<number, number>,
    orderStatusesMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const ordersMap = new Map<number, number>();
    for (const [rmsSectionId, sectionId] of sectionsMap) {
      const allRmsOrders = await this.orderService.findMany(
        rmsAccountId,
        rmsOwner,
        { sectionId: rmsSectionId },
        { expand: ['items'] },
      );
      const rmsOrders = allRmsOrders.filter((o) => entitiesMap.has(o.entityId));
      for (const rmsOrder of rmsOrders) {
        const items = rmsOrder.items
          .map((i) => {
            const reservations = i.reservations.map((r) => {
              return { warehouseId: warehousesMap.get(r.warehouseId), quantity: r.quantity };
            });
            return {
              id: undefined,
              unitPrice: i.unitPrice,
              quantity: i.quantity,
              tax: i.tax,
              discount: i.discount,
              productId: productsMap.get(i.productId),
              sortOrder: i.sortOrder,
              productInfo: undefined,
              reservations,
            };
          })
          .filter((i) => i.productId);
        if (items.length) {
          const order = await this.orderService.create(accountId, owner, sectionId, {
            entityId: entitiesMap.get(rmsOrder.entityId),
            currency: rmsOrder.currency,
            taxIncluded: rmsOrder.taxIncluded,
            statusId: rmsOrder.statusId ? orderStatusesMap.get(rmsOrder.statusId) : null,
            warehouseId: rmsOrder.warehouseId ? warehousesMap.get(rmsOrder.warehouseId) : null,
            items,
          });
          ordersMap.set(rmsOrder.id, order.id);
        }
      }
    }
    return ordersMap;
  }

  private async copyRentalOrders(
    rmsAccountId: number,
    rmsOwner: User,
    accountId: number,
    owner: User,
    entitiesMap: Map<number, number>,
    sectionsMap: Map<number, number>,
    warehousesMap: Map<number, number>,
    productsMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const ordersMap = new Map<number, number>();
    for (const [rmsSectionId, sectionId] of sectionsMap) {
      const allRmsOrders = await this.rentalOrderService.findMany(rmsAccountId, rmsOwner, {
        sectionId: rmsSectionId,
      });
      const rmsOrders = allRmsOrders.filter((o) => entitiesMap.has(o.entityId));
      for (const rmsOrder of rmsOrders) {
        const periods = rmsOrder.periods.map((p) => {
          return { startDate: p.startDate.toISOString(), endDate: p.endDate.toISOString() };
        });
        const items = rmsOrder.items
          .map((i) => {
            return {
              productId: productsMap.get(i.productId),
              unitPrice: i.unitPrice,
              tax: i.tax,
              discount: i.discount,
              sortOrder: i.sortOrder,
            };
          })
          .filter((i) => i.productId);
        if (items.length) {
          const order = await this.rentalOrderService.create(accountId, owner, sectionId, {
            warehouseId: rmsOrder.warehouseId ? warehousesMap.get(rmsOrder.warehouseId) : null,
            currency: rmsOrder.currency,
            taxIncluded: rmsOrder.taxIncluded,
            status: rmsOrder.status,
            entityId: entitiesMap.get(rmsOrder.entityId),
            periods,
            items,
          });
          ordersMap.set(rmsOrder.id, order.id);
        }
      }
    }
    return ordersMap;
  }
}
