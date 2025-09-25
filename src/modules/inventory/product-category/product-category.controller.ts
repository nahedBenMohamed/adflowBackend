import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { ProductCategoryDto, CreateProductCategoryDto, UpdateProductCategoryDto } from './dto';
import { ProductCategoryService } from './product-category.service';

@ApiTags('inventory/products/category')
@Controller('products/sections/:sectionId/categories')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class ProductCategoryController {
  constructor(private readonly service: ProductCategoryService) {}

  @ApiCreatedResponse({ description: 'Create product category', type: ProductCategoryDto })
  @Post()
  public async createCategory(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: CreateProductCategoryDto,
  ) {
    return await this.service.create(accountId, user, sectionId, dto);
  }

  @ApiCreatedResponse({ description: 'Get product categories', type: [ProductCategoryDto] })
  @Get()
  public async getCategories(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ) {
    return await this.service.getHierarchy(accountId, user, sectionId);
  }

  @ApiCreatedResponse({ description: 'Update product category', type: ProductCategoryDto })
  @Put('/:categoryId')
  public async updateCategory(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() dto: UpdateProductCategoryDto,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    return await this.service.update(accountId, user, sectionId, categoryId, dto);
  }

  @ApiCreatedResponse({ description: 'Delete product category' })
  @Delete('/:categoryId')
  public async deleteCategory(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('newCategoryId') newCategoryId?: number,
  ): Promise<void> {
    await this.service.delete(accountId, user, sectionId, categoryId, isNaN(newCategoryId) ? null : newCategoryId);
  }
}
