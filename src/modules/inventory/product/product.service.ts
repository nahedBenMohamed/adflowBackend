import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Not, Repository } from 'typeorm';

import {
  BadRequestError,
  DatePeriod,
  DatePeriodDto,
  DateUtil,
  FileLinkSource,
  NotFoundError,
  PagingQuery,
} from '@/common';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { StorageService } from '@/modules/storage/storage.service';
import { StorageFile } from '@/modules/storage/types/storage-file';
import { FileLinkService } from '@/CRM/Service/FileLink/FileLinkService';
import { FileLinkDto } from '@/CRM/Service/FileLink/FileLinkDto';

import { ProductPriceService } from '../product-price/product-price.service';
import { ProductStockService } from '../product-stock/product-stock.service';
import { ProductCategoryService } from '../product-category/product-category.service';
import { RentalScheduleService } from '../rental-schedule/rental-schedule.service';

import { ProductType } from './enums/product-type.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsMeta } from './dto/get-products.meta';
import { GetProductsResult } from './dto/get-products.result';
import { ProductDto } from './dto/product.dto';
import { ProductsFilter } from './dto/products-filter';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
    private readonly authService: AuthorizationService,
    private readonly productPriceService: ProductPriceService,
    private readonly fileLinkService: FileLinkService,
    private readonly storageService: StorageService,
    @Inject(forwardRef(() => ProductStockService))
    private readonly stockService: ProductStockService,
    private readonly categoryService: ProductCategoryService,
    @Inject(forwardRef(() => RentalScheduleService))
    private readonly scheduleService: RentalScheduleService,
  ) {}

  public async create(account: Account, user: User, sectionId: number, dto: CreateProductDto): Promise<ProductDto> {
    await this.authService.check({
      action: 'create',
      user,
      authorizable: Product.getAuthorizable(sectionId),
      throwError: true,
    });

    if (dto.sku && (await this.exists(account.id, sectionId, dto.sku))) {
      throw new BadRequestError(`Product with sku ${dto.sku} already exists.`);
    }

    const product = await this.repository.save(Product.fromDto(account.id, sectionId, user.id, dto));

    if (dto.prices?.length > 0) {
      await this.productPriceService.createPricesForProduct(account.id, product.id, dto.prices);
    }
    if (dto.photoFileIds?.length > 0) {
      await this.fileLinkService.processFiles(account.id, FileLinkSource.PRODUCT_PHOTO, product.id, dto.photoFileIds);
    }
    if (dto.stocks?.length > 0) {
      await this.stockService.create({ accountId: account.id, productId: product.id, dtos: dto.stocks });
    }

    return await this.createDto(account, user, product);
  }

  public async findById(accountId: number, sectionId: number, productId: number): Promise<Product> {
    return await this.repository.findOneBy({ accountId, id: productId, sectionId });
  }
  public async getById(accountId: number, user: User, sectionId: number, productId: number): Promise<Product> {
    const product = await this.findById(accountId, sectionId, productId);
    if (!product) {
      throw NotFoundError.withId(Product, productId);
    }
    await this.authService.check({ action: 'view', user, authorizable: product, throwError: true });

    return product;
  }

  private async exists(accountId: number, sectionId: number, sku: string, excludeProductId?: number): Promise<boolean> {
    return this.repository.existsBy({
      accountId,
      sectionId,
      sku,
      isDeleted: false,
      id: excludeProductId ? Not(excludeProductId) : undefined,
    });
  }

  public async getDtoById(account: Account, user: User, sectionId: number, productId: number): Promise<ProductDto> {
    const product = await this.getById(account.id, user, sectionId, productId);

    return await this.createDto(account, user, product);
  }

  public async getProducts(
    account: Account,
    user: User,
    sectionId: number,
    filter: ProductsFilter,
    periodDto: DatePeriodDto,
    paging: PagingQuery,
  ): Promise<GetProductsResult> {
    await this.authService.check({
      action: 'view',
      user,
      authorizable: Product.getAuthorizable(sectionId),
      throwError: true,
    });

    const qb = await this.createQb(account.id, sectionId, filter);

    const products = await qb.orderBy('created_at', 'DESC').offset(paging.skip).limit(paging.take).getMany();
    const period = DatePeriod.fromDto(periodDto);
    const dtos = await Promise.all(products.map((product) => this.createDto(account, user, product, period)));
    const totalCount = await qb.getCount();

    return new GetProductsResult(dtos, new GetProductsMeta(totalCount));
  }

  public async getProductsSimple(
    accountId: number,
    sectionId: number,
    filter: ProductsFilter,
    paging: PagingQuery,
  ): Promise<Product[]> {
    const qb = await this.createQb(accountId, sectionId, filter);

    return await qb.orderBy('created_at', 'DESC').offset(paging.skip).limit(paging.take).getMany();
  }

  //TODO: Change ProductDto to Product with prices and stocks
  public async findManyFull(
    account: Account,
    user: User,
    sectionId: number,
    filter?: ProductsFilter,
  ): Promise<ProductDto[]> {
    const qb = await this.createQb(account.id, sectionId, filter);
    const products = await qb.getMany();
    return await Promise.all(products.map((product) => this.createDto(account, user, product)));
  }

  public async update(
    account: Account,
    user: User,
    sectionId: number,
    productId: number,
    dto: UpdateProductDto,
  ): Promise<ProductDto> {
    await this.authService.check({
      action: 'edit',
      user,
      authorizable: Product.getAuthorizable(sectionId),
      throwError: true,
    });

    if (dto.sku && (await this.exists(account.id, sectionId, dto.sku, productId))) {
      throw new BadRequestError(`Product with sku ${dto.sku} already exists.`);
    }

    await this.repository.update(
      { id: productId, accountId: account.id, sectionId },
      {
        name: dto.name,
        description: dto.description,
        sku: dto.sku,
        unit: dto.unit,
        tax: dto.tax,
        categoryId: dto.categoryId,
        updatedAt: DateUtil.now(),
      },
    );

    return await this.getDtoById(account, user, sectionId, productId);
  }

  public async markDeleted(accountId: number, user: User, sectionId: number, productId: number) {
    await this.authService.check({
      action: 'delete',
      user,
      authorizable: Product.getAuthorizable(sectionId),
      throwError: true,
    });

    await this.repository.update({ accountId, id: productId, sectionId }, { isDeleted: true });
  }

  public async delete(accountId: number, ids: number[]) {
    for (const id of ids) {
      this.fileLinkService.processFiles(accountId, FileLinkSource.PRODUCT_PHOTO, id, []);
    }
    await this.repository.delete({ accountId, id: In(ids) });
  }

  public async uploadPhotos(
    account: Account,
    user: User,
    sectionId: number,
    productId: number,
    files: StorageFile[],
  ): Promise<FileLinkDto[]> {
    await this.authService.check({
      action: 'edit',
      user,
      authorizable: Product.getAuthorizable(sectionId),
      throwError: true,
    });

    const fileInfos = await this.storageService.storeProductFiles({
      accountId: account.id,
      userId: user.id,
      productId,
      files,
      section: 'photos',
    });
    return await this.fileLinkService.addFiles(
      account,
      FileLinkSource.PRODUCT_PHOTO,
      productId,
      fileInfos.map((fileInfo) => fileInfo.id),
    );
  }

  private async createDto(account: Account, user: User, product: Product, period?: DatePeriod): Promise<ProductDto> {
    const prices = await this.productPriceService.getPricesForProduct(account.id, product.id);
    const fileLinks = await this.fileLinkService.getFileLinkDtos(account, FileLinkSource.PRODUCT_PHOTO, product.id);
    const stocks = await this.stockService.findMany({ user, filter: { accountId: account.id, productId: product.id } });

    if (period?.from && period?.to) {
      const status = await this.scheduleService.checkProductStatus(account.id, product.sectionId, product.id, [period]);

      return product.toDto(prices, fileLinks, stocks, status.status, status.events);
    }

    return product.toDto(prices, fileLinks, stocks);
  }

  private async createQb(accountId: number, sectionId: number, filter?: ProductsFilter) {
    const qb = this.repository
      .createQueryBuilder('p')
      .where('p.account_id = :accountId', { accountId })
      .andWhere('p.section_id = :sectionId', { sectionId })
      .andWhere({ isDeleted: false });

    if (filter?.ids) {
      qb.andWhere('id IN (:...ids)', { ids: filter.ids.split(',').map((id) => parseInt(id)) });
      return qb;
    }

    if (filter?.categoryId) {
      const categories = await this.categoryService.getCategoriesFlat(accountId, sectionId, filter.categoryId);
      qb.andWhere('p.category_id IN (:...categoryIds)', { categoryIds: categories.map((c) => c.id) });
    }

    if (filter?.warehouseId) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('p.type IN (:...types)', { types: [ProductType.SERVICE, ProductType.KIT] }).orWhere(
            '0 < (select sum(s.stock_quantity) from product_stock s where s.product_id = p.id and warehouse_id = :wId)',
            {
              wId: filter.warehouseId,
            },
          );
        }),
      );
    }

    if (filter?.search) {
      qb.andWhere(
        new Brackets((qb1) =>
          qb1
            .where('p.name ILIKE :searchName', { searchName: `%${filter.search}%` })
            .orWhere('p.sku ILIKE :searchSku', { searchSku: `%${filter.search}%` }),
        ),
      );
    }

    if (filter?.sku) {
      qb.andWhere('p.sku = :sku', { sku: filter.sku });
    }

    return qb;
  }
}
