import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { UserAccess } from '@/modules/iam/common/decorators/user-access.decorator';

import { ProductsSectionDto, CreateProductsSectionDto, UpdateProductsSectionDto, LinkModulesDto } from './dto';
import { ProductsSectionService } from './services/products-section.service';

@ApiTags('inventory/section')
@Controller('products/sections')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class ProductsSectionController {
  constructor(private readonly service: ProductsSectionService) {}

  @ApiCreatedResponse({ description: 'Create product section', type: ProductsSectionDto })
  @Post()
  @UserAccess({ adminOnly: true })
  public async create(@CurrentAuth() { accountId }: AuthData, @Body() dto: CreateProductsSectionDto) {
    return await this.service.create(accountId, dto);
  }

  @ApiCreatedResponse({ description: 'Get all product sections', type: [ProductsSectionDto] })
  @Get()
  public async getMany(@CurrentAuth() { accountId, user }: AuthData) {
    return await this.service.getAllFull(accountId, user);
  }

  @ApiCreatedResponse({ description: 'Get product section', type: ProductsSectionDto })
  @Get('/:sectionId')
  public async getOne(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ) {
    return await this.service.getOneFull(accountId, user, sectionId);
  }

  @ApiCreatedResponse({ description: 'Update product section', type: ProductsSectionDto })
  @Put('/:sectionId')
  @UserAccess({ adminOnly: true })
  public async update(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: UpdateProductsSectionDto,
  ) {
    return await this.service.update(accountId, user, sectionId, dto);
  }

  @ApiCreatedResponse({ description: 'Delete product section', type: Boolean })
  @Delete('/:sectionId')
  @UserAccess({ adminOnly: true })
  public async delete(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ): Promise<boolean> {
    return await this.service.delete(accountId, user, sectionId);
  }

  @ApiCreatedResponse({ description: 'Link products to entity types', type: Boolean })
  @Post('/:sectionId/link')
  @UserAccess({ adminOnly: true })
  public async linkEntityTypes(
    @CurrentAuth() { accountId }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body('entityTypeIds') entityTypeIds: number[],
  ): Promise<boolean> {
    return await this.service.linkEntityTypes(accountId, sectionId, entityTypeIds);
  }

  @ApiCreatedResponse({ description: 'Link products to entity types', type: Boolean })
  @Post('/:sectionId/links')
  @UserAccess({ adminOnly: true })
  public async link(
    @CurrentAuth() { accountId }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: LinkModulesDto,
  ): Promise<boolean> {
    return await this.service.link(accountId, sectionId, dto);
  }
}
