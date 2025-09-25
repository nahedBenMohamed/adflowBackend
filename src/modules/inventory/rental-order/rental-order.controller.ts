import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { RentalOrderDto, CreateRentalOrderDto, RentalOrderFilter, UpdateRentalOrderDto } from './dto';
import { RentalOrder } from './entities';
import { RentalOrderStatus } from './enums';
import { RentalOrderService } from './services';

@ApiTags('inventory/rental/orders')
@Controller('rental/sections/:sectionId/orders')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class RentalOrderController {
  constructor(private readonly service: RentalOrderService) {}

  @ApiCreatedResponse({ description: 'Create rental order', type: RentalOrderDto })
  @Post()
  public async create(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: CreateRentalOrderDto,
  ): Promise<RentalOrder> {
    return await this.service.create(accountId, user, sectionId, dto);
  }

  @ApiCreatedResponse({ description: 'Get rental order', type: RentalOrderDto })
  @Get('/:orderId')
  public async getOne(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<RentalOrder> {
    return this.service.getOne(accountId, user, sectionId, orderId);
  }

  @ApiCreatedResponse({ description: 'Get entity rental orders', type: [RentalOrderDto] })
  @Post('/search')
  public async getMany(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() filter?: RentalOrderFilter,
  ): Promise<RentalOrder[]> {
    return this.service.findMany(accountId, user, { ...filter, sectionId });
  }

  @ApiCreatedResponse({ description: 'Get entity rental orders', type: [RentalOrderDto] })
  @Get('/entity/:entityId')
  public async getForEntity(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('entityId', ParseIntPipe) entityId: number,
  ): Promise<RentalOrder[]> {
    return this.service.findMany(accountId, user, { sectionId, entityId });
  }

  @ApiCreatedResponse({ description: 'Update rental order', type: RentalOrderDto })
  @Put('/:orderId')
  public async update(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() dto: UpdateRentalOrderDto,
  ): Promise<RentalOrder> {
    return this.service.update(accountId, user, sectionId, orderId, dto);
  }

  @ApiOkResponse({ description: 'Delete rental order' })
  @Delete('/:orderId')
  public async delete(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<void> {
    return this.service.delete(accountId, user, { sectionId, orderId }, { checkPermission: true });
  }

  @ApiCreatedResponse({ description: 'Change rental order status', type: RentalOrderDto })
  @Put('/:orderId/status/:status')
  public async changeStatus(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('status') status: RentalOrderStatus,
  ): Promise<RentalOrder> {
    return this.service.changeStatus(accountId, user, sectionId, orderId, status);
  }
}
