import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotFoundError } from '@/common';

import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';

import { Product } from '../product/entities/product.entity';
import { CreateProductPriceDto } from './dto/create-product-price.dto';
import { UpdateProductPriceDto } from './dto/update-product-price.dto';
import { ProductPrice } from './entities/product-price.entity';
import { InvalidDiscountError } from './errors/invalid-discount.error';

const MAX_DISCOUNT_PERCENT = 100;
const MIN_DISCOUNT_PERCENT = 0;

@Injectable()
export class ProductPriceService {
  constructor(
    @InjectRepository(ProductPrice)
    private readonly repository: Repository<ProductPrice>,
    private readonly authService: AuthorizationService,
  ) {}

  public async create(
    accountId: number,
    user: User,
    sectionId: number,
    productId: number,
    dto: CreateProductPriceDto,
  ): Promise<ProductPrice> {
    await this.authService.check({
      action: 'edit',
      user,
      authorizable: Product.getAuthorizable(sectionId),
      throwError: true,
    });

    return await this.createInternal(accountId, productId, dto);
  }

  private async createInternal(
    accountId: number,
    productId: number,
    dto: CreateProductPriceDto,
  ): Promise<ProductPrice> {
    this.checkMaxDiscountValue(dto.maxDiscount);
    return await this.repository.save(ProductPrice.fromDto(accountId, productId, dto));
  }

  public async createPricesForProduct(
    accountId: number,
    productId: number,
    dtos: CreateProductPriceDto[],
  ): Promise<ProductPrice[]> {
    return await Promise.all(dtos.map(async (dto) => await this.createInternal(accountId, productId, dto)));
  }

  public async getPricesForProduct(accountId: number, productId: number): Promise<ProductPrice[]> {
    return this.repository.find({
      where: { accountId, productId },
      order: { id: 'asc' },
    });
  }

  private async getById(productId: number, priceId: number): Promise<ProductPrice> {
    const price = await this.repository.findOneBy({ productId, id: priceId });

    if (!price) {
      throw NotFoundError.withId(ProductPrice, priceId);
    }

    return price;
  }

  public async update(
    user: User,
    sectionId: number,
    productId: number,
    priceId: number,
    dto: UpdateProductPriceDto,
  ): Promise<ProductPrice> {
    await this.authService.check({
      action: 'edit',
      user,
      authorizable: Product.getAuthorizable(sectionId),
      throwError: true,
    });
    this.checkMaxDiscountValue(dto.maxDiscount);
    const price = await this.getById(productId, priceId);
    await this.repository.save(price.update(dto));

    return price;
  }

  public async delete(
    accountId: number,
    user: User,
    sectionId: number,
    productId: number,
    priceId: number,
  ): Promise<void> {
    await this.authService.check({
      action: 'edit',
      user,
      authorizable: Product.getAuthorizable(sectionId),
      throwError: true,
    });

    const result = await this.repository.delete({ accountId, productId, id: priceId });
    if (result.affected === 0) {
      throw NotFoundError.withId(ProductPrice, priceId);
    }
  }

  private checkMaxDiscountValue(discount: number | null | undefined) {
    if (
      (discount !== null || discount !== undefined) &&
      discount > MAX_DISCOUNT_PERCENT &&
      discount < MIN_DISCOUNT_PERCENT
    ) {
      throw new InvalidDiscountError();
    }
  }
}
