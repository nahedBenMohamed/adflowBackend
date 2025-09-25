import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto, DatePeriodDto, PagingQuery } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { ProductsFilter } from '../product/dto/products-filter';

import { RentalScheduleDto, CheckRentalStatusDto, RentalEventDto, ProductRentalStatusDto } from './dto';
import { RentalScheduleService } from './rental-schedule.service';

@ApiTags('inventory/rental/schedule')
@Controller('rental/sections/:sectionId/schedule')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class RentalScheduleController {
  constructor(private readonly service: RentalScheduleService) {}

  @ApiCreatedResponse({ description: 'Get rental schedule', type: RentalScheduleDto })
  @Get()
  public async getSchedule(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Query() period: DatePeriodDto,
    @Query() filter: ProductsFilter,
    @Query() paging: PagingQuery,
  ) {
    return this.service.getSchedule(accountId, user, sectionId, period, filter, paging);
  }

  @ApiCreatedResponse({ description: 'Get rental schedule', type: [ProductRentalStatusDto] })
  @Post('check')
  public async checkProductsStatus(
    @CurrentAuth() { accountId }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: CheckRentalStatusDto,
  ) {
    return this.service.checkProductsStatus(accountId, sectionId, dto);
  }

  @ApiCreatedResponse({ description: 'Get rental events schedule for product', type: [RentalEventDto] })
  @Get('products/:productId')
  public async getProductSchedule(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Query() period: DatePeriodDto,
  ) {
    return this.service.getProductSchedule(accountId, user, sectionId, productId, period);
  }

  @ApiOkResponse({ description: 'Release block for product in date interval' })
  @Put('products/:productId/release')
  public async releaseProduct(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() period: DatePeriodDto,
  ) {
    return this.service.releaseProductByDates(accountId, user, sectionId, productId, period);
  }
}
