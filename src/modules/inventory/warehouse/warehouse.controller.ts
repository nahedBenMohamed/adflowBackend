import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { WarehouseDto, CreateWarehouseDto, UpdateWarehouseDto } from './dto';
import { WarehouseService } from './warehouse.service';

@ApiTags('inventory/warehouses')
@Controller('products/sections/:sectionId/warehouses')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class WarehouseController {
  constructor(private readonly service: WarehouseService) {}

  @ApiOperation({ summary: 'Create warehouse', description: 'Create warehouse in inventory section' })
  @ApiParam({ name: 'sectionId', type: Number, required: true, description: 'Section ID' })
  @ApiBody({ type: CreateWarehouseDto, required: true, description: 'Warehouse data' })
  @ApiCreatedResponse({ description: 'Warehouse', type: WarehouseDto })
  @Post()
  public async create(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: CreateWarehouseDto,
  ) {
    return this.service.create({ accountId, user, sectionId, dto });
  }

  @ApiOperation({ summary: 'Get warehouses', description: 'Get available warehouses in inventory section' })
  @ApiParam({ name: 'sectionId', type: Number, required: true, description: 'Section ID' })
  @ApiOkResponse({ description: 'Warehouses', type: [WarehouseDto] })
  @Get()
  public async findMany(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ) {
    return this.service.findMany({ user, filter: { accountId, sectionId } });
  }

  @ApiOperation({ summary: 'Update warehouse', description: 'Update warehouse in inventory section' })
  @ApiParam({ name: 'sectionId', type: Number, required: true, description: 'Section ID' })
  @ApiParam({ name: 'warehouseId', type: Number, required: true, description: 'Warehouse ID' })
  @ApiBody({ type: UpdateWarehouseDto, required: true, description: 'Warehouse data' })
  @ApiOkResponse({ description: 'Warehouse', type: WarehouseDto })
  @Put(':warehouseId')
  public async update(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.service.update({ accountId, user, sectionId, warehouseId, dto });
  }

  @ApiOperation({ summary: 'Delete warehouse', description: 'Delete warehouse in inventory section' })
  @ApiParam({ name: 'sectionId', type: Number, required: true, description: 'Section ID' })
  @ApiParam({ name: 'warehouseId', type: Number, required: true, description: 'Warehouse ID' })
  @ApiQuery({ name: 'newWarehouseId', type: Number, required: false, description: 'New warehouse ID' })
  @ApiOkResponse()
  @Delete(':warehouseId')
  public async delete(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('warehouseId', ParseIntPipe) warehouseId: number,
    @Query('newWarehouseId') newWarehouseId?: number,
  ) {
    return this.service.delete({ accountId, user, sectionId, warehouseId, newWarehouseId });
  }
}
