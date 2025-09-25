import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { DatePeriodDto, TransformToDto } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { SalesPlanProgressDto } from './dto/sales-plan-progress.dto';
import { SalesPlanDto } from './dto/sales-plan.dto';
import { SalesPlanService } from './sales-plan.service';

@ApiTags('crm/sales-plans')
@Controller('/crm/entity-types/:entityTypeId/sales-plans')
@JwtAuthorized()
@TransformToDto()
export class SalesPlanController {
  constructor(private readonly service: SalesPlanService) {}

  @ApiCreatedResponse({ type: [SalesPlanDto] })
  @Post('settings')
  public async create(
    @CurrentAuth() { accountId }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Body() dtos: SalesPlanDto[],
  ) {
    return await this.service.upsertMany(accountId, entityTypeId, dtos);
  }

  @ApiCreatedResponse({ type: [SalesPlanDto] })
  @Get('settings')
  public async getMany(
    @CurrentAuth() { accountId }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Query() period: DatePeriodDto,
  ) {
    return await this.service.getMany(accountId, entityTypeId, period);
  }

  @ApiCreatedResponse({ type: [SalesPlanProgressDto] })
  @Get()
  public async getProgress(
    @CurrentAuth() { accountId }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Query() period: DatePeriodDto,
  ) {
    return await this.service.getProgress(accountId, entityTypeId, period);
  }

  @ApiCreatedResponse({ type: [SalesPlanDto] })
  @Put('settings')
  public async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Body() dtos: SalesPlanDto[],
  ) {
    return await this.service.upsertMany(accountId, entityTypeId, dtos);
  }

  @ApiCreatedResponse({ type: [SalesPlanDto] })
  @Delete('settings')
  public async deleteAll(
    @CurrentAuth() { accountId }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Query() period: DatePeriodDto,
  ) {
    return await this.service.deleteAll(accountId, entityTypeId, period);
  }

  @ApiCreatedResponse({ type: [SalesPlanDto] })
  @Delete('settings/users/:userId')
  public async delete(
    @CurrentAuth() { accountId }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Query() period: DatePeriodDto,
  ) {
    return await this.service.delete(accountId, entityTypeId, userId, period);
  }
}
