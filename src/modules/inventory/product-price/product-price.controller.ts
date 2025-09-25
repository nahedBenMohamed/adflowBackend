import { Body, Controller, Delete, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { ProductPriceService } from './product-price.service';
import { ProductPrice } from './entities/product-price.entity';
import { ProductPriceDto } from './dto/product-price.dto';
import { CreateProductPriceDto } from './dto/create-product-price.dto';
import { UpdateProductPriceDto } from './dto/update-product-price.dto';

@ApiTags('inventory/products/prices')
@Controller('products/sections/:sectionId/products/:productId/prices')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class ProductPriceController {
  constructor(private readonly service: ProductPriceService) {}

  @ApiCreatedResponse({ description: 'Create product price', type: ProductPriceDto })
  @Post()
  public async create(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductPriceDto,
  ): Promise<ProductPrice> {
    return await this.service.create(accountId, user, sectionId, productId, dto);
  }

  @ApiCreatedResponse({ description: 'Update product price', type: ProductPriceDto })
  @Put('/:priceId')
  public async update(
    @CurrentAuth() { user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Param('priceId', ParseIntPipe) priceId: number,
    @Body() dto: UpdateProductPriceDto,
  ): Promise<ProductPrice> {
    return await this.service.update(user, sectionId, productId, priceId, dto);
  }

  @ApiCreatedResponse({ description: 'Delete product price' })
  @Delete('/:priceId')
  public async delete(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Param('priceId', ParseIntPipe) priceId: number,
  ): Promise<void> {
    await this.service.delete(accountId, user, sectionId, productId, priceId);
  }
}
