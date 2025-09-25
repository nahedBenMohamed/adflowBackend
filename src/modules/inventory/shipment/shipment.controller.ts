import { Controller, Get, Param, ParseIntPipe, Put, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { PagingQuery, TransformToDto } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { ChangeStatusQuery, ShipmentDto, ShipmentFilterDto, ShipmentResultDto } from './dto';
import { ShipmentService } from './shipment.service';

@ApiTags('inventory/shipments')
@Controller('products/sections/:sectionId/shipments')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class ShipmentController {
  constructor(private readonly service: ShipmentService) {}

  @ApiCreatedResponse({ description: 'Get shipment by id', type: ShipmentDto })
  @Get('/:shipmentId')
  public async getShipment(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('shipmentId', ParseIntPipe) shipmentId: number,
  ) {
    return this.service.findOne({ accountId, user, filter: { sectionId, shipmentId } });
  }

  @ApiCreatedResponse({ description: 'Get shipments', type: ShipmentResultDto })
  @Get()
  public async getShipments(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Query() filter: ShipmentFilterDto,
    @Query() paging: PagingQuery,
  ) {
    return this.service.getShipments({ accountId, user, sectionId, orderId: filter.orderId, paging });
  }

  @ApiCreatedResponse({ description: 'Change shipment status', type: ShipmentDto })
  @Put('/:shipmentId/status/:statusId')
  public async changeStatus(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('shipmentId', ParseIntPipe) shipmentId: number,
    @Param('statusId', ParseIntPipe) statusId: number,
    @Query() query: ChangeStatusQuery,
  ) {
    return this.service.changeStatus(accountId, user, sectionId, shipmentId, statusId, query);
  }
}
