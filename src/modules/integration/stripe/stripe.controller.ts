import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { SubscriptionOrderDto } from './dto';
import { StripeService } from './stripe.service';

@ApiTags('integration/stripe')
@Controller('iam/subscriptions/stripe')
@JwtAuthorized({ prefetch: { account: true } })
export class StripeController {
  constructor(private readonly service: StripeService) {}

  @ApiOperation({ summary: 'Create checkout session', description: 'Create checkout session' })
  @ApiOkResponse({ type: String, description: 'Checkout URL' })
  @Get('checkout')
  public async getCheckoutUrl(
    @CurrentAuth() { account, userId }: AuthData,
    @Query() dto: SubscriptionOrderDto,
  ): Promise<string> {
    return this.service.getCheckoutUrl(account, userId, dto);
  }

  @ApiOperation({ summary: 'Get customer portal URL', description: 'Get customer portal URL' })
  @ApiOkResponse({ type: String, description: 'Customer portal URL' })
  @Get('portal')
  public async getCustomerPortalUrl(@CurrentAuth() { account }: AuthData): Promise<string> {
    return this.service.getCustomerPortalUrl(account);
  }
}
