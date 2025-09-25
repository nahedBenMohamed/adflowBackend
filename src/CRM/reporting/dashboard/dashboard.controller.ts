import { Body, Controller, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TransformToDto, PagingQuery } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import {
  SellersRatingReportDto,
  DashboardFilterDto,
  TopSellersReportDto,
  SalesPlanReportDto,
  EntitySummaryReportDto,
  TaskSummaryReportDto,
  SalesPipelineReportDto,
  SalesPipelineFilterDto,
} from './dto';
import { DashboardService } from './dashboard.service';

@ApiTags('crm/reporting/dashboard')
@Controller('crm/entity-types/:entityTypeId/dashboard')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @ApiOperation({ summary: 'Get sellers rating report', description: 'Get sellers rating report' })
  @ApiParam({ name: 'entityTypeId', description: 'EntityType ID', type: Number, required: true })
  @ApiBody({ type: DashboardFilterDto, required: true, description: 'Dashboard filter' })
  @ApiOkResponse({ description: 'Sellers report', type: SellersRatingReportDto })
  @Post('rating')
  public async getSellersRating(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Body() filter: DashboardFilterDto,
    @Query() paging: PagingQuery,
  ) {
    return this.service.getSellersRating({ accountId, user, entityTypeId, filter, paging });
  }

  @ApiOperation({ summary: 'Get top sellers report', description: 'Get top sellers report' })
  @ApiParam({ name: 'entityTypeId', description: 'EntityType ID', type: Number, required: true })
  @ApiBody({ type: DashboardFilterDto, required: true, description: 'Dashboard filter' })
  @ApiOkResponse({ description: 'Top sellers report', type: TopSellersReportDto })
  @Post('top-sellers')
  public async getTopSellers(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Body() filter: DashboardFilterDto,
    @Query('limit') limit?: string,
  ) {
    return this.service.getTopSellers({
      accountId,
      user,
      entityTypeId,
      filter,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @ApiOperation({ summary: 'Get sales plan report', description: 'Get sales plan report' })
  @ApiParam({ name: 'entityTypeId', description: 'EntityType ID', type: Number, required: true })
  @ApiBody({ type: DashboardFilterDto, required: true, description: 'Dashboard filter' })
  @ApiOkResponse({ description: 'Sales plan report', type: SalesPlanReportDto })
  @Post('sales-plan')
  public async getSalesPlanSummary(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Body() filter: DashboardFilterDto,
  ) {
    return this.service.getSalesPlanSummary({ accountId, user, entityTypeId, filter });
  }

  @ApiOperation({ summary: 'Get entity type summary report', description: 'Get entity type summary report' })
  @ApiParam({ name: 'entityTypeId', description: 'EntityType ID', type: Number, required: true })
  @ApiBody({ type: DashboardFilterDto, required: true, description: 'Dashboard filter' })
  @ApiOkResponse({ description: 'Entity type summary report', type: EntitySummaryReportDto })
  @Post('summary/entities')
  public async getEntitiesSummary(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Body() filter: DashboardFilterDto,
  ) {
    return this.service.getEntitiesSummary({ accountId, user, entityTypeId, filter });
  }

  @ApiOperation({ summary: 'Get tasks summary report', description: 'Get tasks summary report' })
  @ApiParam({ name: 'entityTypeId', description: 'EntityType ID', type: Number, required: true })
  @ApiBody({ type: DashboardFilterDto, required: true, description: 'Dashboard filter' })
  @ApiOkResponse({ description: 'Tasks summary report', type: TaskSummaryReportDto })
  @Post('summary/tasks')
  public async getTasksSummary(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Body() filter: DashboardFilterDto,
  ) {
    return this.service.getTasksSummary({ accountId, user, entityTypeId, filter });
  }

  @ApiOperation({ summary: 'Get activities summary report', description: 'Get activities summary report' })
  @ApiParam({ name: 'entityTypeId', description: 'EntityType ID', type: Number, required: true })
  @ApiBody({ type: DashboardFilterDto, required: true, description: 'Dashboard filter' })
  @ApiOkResponse({ description: 'Get activities summary report', type: TaskSummaryReportDto })
  @Post('summary/activities')
  public async getActivitiesSummary(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Body() filter: DashboardFilterDto,
  ) {
    return this.service.getActivitiesSummary({ accountId, user, entityTypeId, filter });
  }

  @ApiOperation({ summary: 'Get sales pipeline report', description: 'Get sales pipeline report' })
  @ApiParam({ name: 'entityTypeId', description: 'EntityType ID', type: Number, required: true })
  @ApiBody({ type: SalesPipelineFilterDto, required: true, description: 'Sales pipeline filter' })
  @ApiOkResponse({ description: 'Get top sales pipeline report', type: SalesPipelineReportDto })
  @Post('pipeline')
  public async getSalesPipeline(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Body() filter: SalesPipelineFilterDto,
  ) {
    return this.service.getSalesPipeline({ accountId, user, entityTypeId, filter });
  }
}
