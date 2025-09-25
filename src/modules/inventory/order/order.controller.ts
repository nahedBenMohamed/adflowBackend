import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

import { ExpandQuery, TransformToDto } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { ExpandableField } from './types/expandable-field';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto } from './dto/order.dto';
import { OrderFilterDto } from './dto/order-filter.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './services/order.service';

@ApiTags('inventory/orders')
@Controller('products')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @ApiCreatedResponse({ description: 'Create order', type: OrderDto })
  @Post('sections/:sectionId/orders')
  public async create(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: CreateOrderDto,
  ) {
    return await this.service.create(accountId, user, sectionId, dto);
  }

  @ApiOkResponse({ description: 'Get orders for entity', type: [OrderDto] })
  @ApiQuery({
    name: 'expand',
    type: String,
    required: false,
    isArray: true,
    description: 'Expand fields. Values: items, shippedAt.',
  })
  @Get('orders')
  public async findMany(
    @CurrentAuth() { accountId, user }: AuthData,
    @Query() filter: OrderFilterDto,
    @Query() expand?: ExpandQuery<ExpandableField>,
  ) {
    return this.service.findMany(accountId, user, filter, { expand: expand.fields });
  }

  @ApiOkResponse({ description: 'Get order', type: OrderDto })
  @ApiQuery({
    name: 'expand',
    type: String,
    required: false,
    isArray: true,
    description: 'Expand fields. Values: items, shippedAt.',
  })
  @Get('orders/:orderId')
  public async findOne(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Query() expand?: ExpandQuery<ExpandableField>,
  ) {
    return this.service.findOne(accountId, user, { orderId }, { expand: expand.fields });
  }

  @ApiCreatedResponse({ description: 'Update order', type: OrderDto })
  @Put('sections/:sectionId/orders/:orderId')
  public async update(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Query('returnStocks') returnStocks: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.service.update(accountId, user, sectionId, orderId, dto, returnStocks === 'true');
  }

  @ApiOkResponse({ description: 'Delete order' })
  @Delete('sections/:sectionId/orders/:orderId')
  public async delete(
    @CurrentAuth() { accountId }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Query('returnStocks') returnStocks: string,
  ) {
    return this.service.delete(accountId, { sectionId, orderId }, { returnStocks: returnStocks === 'true' });
  }
}
