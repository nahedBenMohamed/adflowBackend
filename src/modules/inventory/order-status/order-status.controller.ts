import { Controller, Get } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { OrderStatusDto } from './dto/order-status.dto';
import { OrderStatusService } from './order-status.service';

@ApiTags('inventory/order/statuses')
@Controller('products/order-statuses')
@JwtAuthorized()
@TransformToDto()
export class OrderStatusController {
  constructor(private service: OrderStatusService) {}

  @ApiCreatedResponse({ description: 'Get order statuses', type: [OrderStatusDto] })
  @Get()
  public async getStatuses(@CurrentAuth() { accountId }: AuthData) {
    return this.service.getManyOrDefault(accountId);
  }
}
