import { Body, Controller, Get, Post, RawBodyRequest, Req } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SubscriptionPlanDto } from './dto';
import { StripeService } from './stripe.service';

@ApiTags('integration/stripe')
@Controller('iam/subscriptions/stripe')
export class PublicStripeController {
  constructor(private readonly service: StripeService) {}

  @ApiOperation({ summary: 'Get available subscription plans', description: 'Get available subscription plans' })
  @ApiOkResponse({ type: [SubscriptionPlanDto], description: 'Subscription plans' })
  @Get('plans')
  public async getSubscriptionPlans(): Promise<SubscriptionPlanDto[]> {
    return this.service.getSubscriptionPlans();
  }

  @ApiExcludeEndpoint(true)
  @Post('webhook')
  public async handleWebhook(@Req() request: RawBodyRequest<Request>, @Body() body: unknown): Promise<void> {
    const signature = request.headers['stripe-signature'];
    return await this.service.handleWebhook(body, request.rawBody, signature);
  }
}
