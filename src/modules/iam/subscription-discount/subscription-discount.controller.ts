import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { JwtAuthorized, CurrentAuth, AuthData } from '../common';

import { CurrentDiscountDto } from './dto';
import { SubscriptionDiscountService } from './subscription-discount.service';

@ApiTags('IAM/subscriptions')
@Controller('subscriptions/discount')
@JwtAuthorized()
@TransformToDto()
export class SubscriptionDiscountController {
  constructor(private readonly service: SubscriptionDiscountService) {}

  @ApiOperation({ summary: 'Get current discount for account', description: 'Get current discount for account' })
  @ApiOkResponse({ description: 'Current account discount', type: CurrentDiscountDto })
  @Get('current')
  public async findOne(@CurrentAuth() { accountId }: AuthData) {
    return this.service.findByAccount(accountId);
  }
}
