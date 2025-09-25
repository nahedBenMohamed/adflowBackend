import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { AuthData, AuthDataPrefetch, CurrentAuth, JwtAuthorized } from '../common';

import { AccountSubscriptionDto, UpdateAccountSubscriptionDto } from './dto';
import { AccountSubscriptionService } from './account-subscription.service';

@ApiTags('IAM/subscriptions')
@Controller('subscriptions')
@JwtAuthorized()
@TransformToDto()
export class AccountSubscriptionController {
  constructor(private service: AccountSubscriptionService) {}

  @ApiOkResponse({ description: 'Get subscription for current account', type: AccountSubscriptionDto })
  @Get()
  async get(@CurrentAuth() { accountId }: AuthData) {
    return this.service.get(accountId);
  }

  @ApiOkResponse({ description: 'Get subscription for account', type: AccountSubscriptionDto })
  @AuthDataPrefetch({ user: true })
  @Get(':accountId')
  async getFor(@CurrentAuth() { user }: AuthData, @Param('accountId', ParseIntPipe) accountId: number) {
    return this.service.getSystem(accountId, user);
  }

  @ApiOkResponse({ description: 'Update subscription for account', type: AccountSubscriptionDto })
  @AuthDataPrefetch({ user: true })
  @Patch(':accountId')
  async update(
    @CurrentAuth() { user }: AuthData,
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() dto: UpdateAccountSubscriptionDto,
  ) {
    return this.service.updateSystem(accountId, user, dto);
  }
}
