import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { AuthDataPrefetch } from '@/modules/iam/common/decorators/auth-data-prefetch.decorator';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { TwilioProviderDto, CreateTwilioProviderDto, UpdateTwilioProviderDto } from '../dto';
import { TwilioProviderService } from '../twilio-provider.service';

@ApiTags('multichat/settings/twilio')
@Controller('chat/settings/providers/twilio')
@JwtAuthorized()
@TransformToDto()
export class TwilioProviderController {
  constructor(private readonly service: TwilioProviderService) {}

  @ApiOperation({ summary: 'Create twilio chat provider', description: 'Create twilio chat provider' })
  @ApiBody({ description: 'Data for creating Twilio chat provider', type: CreateTwilioProviderDto })
  @ApiCreatedResponse({ description: 'Twilio chat provider', type: TwilioProviderDto })
  @Post()
  async create(@CurrentAuth() { accountId, userId }: AuthData, @Body() dto: CreateTwilioProviderDto) {
    return this.service.create(accountId, userId, dto);
  }

  @ApiOperation({
    summary: 'Get twilio chat providers with settings',
    description: 'Get twilio chat providers with settings',
  })
  @ApiOkResponse({ description: 'Twilio chat providers', type: [TwilioProviderDto] })
  @AuthDataPrefetch({ user: true })
  @Get()
  async getProvidersWithSettings(@CurrentAuth() { accountId, user }: AuthData) {
    return this.service.getProvidersWithSettings(accountId, user);
  }

  @ApiOperation({
    summary: 'Get twilio chat provider with settings',
    description: 'Get twilio chat provider with settings',
  })
  @ApiParam({ name: 'providerId', description: 'Twilio chat provider ID', type: Number, required: true })
  @ApiOkResponse({ description: 'Twilio chat provider', type: TwilioProviderDto })
  @Get(':providerId')
  async getProviderWithSettings(
    @CurrentAuth() { accountId }: AuthData,
    @Param('providerId', ParseIntPipe) providerId: number,
  ) {
    return this.service.getProviderWithSettings(accountId, providerId);
  }

  @ApiOperation({ summary: 'Update twilio chat provider', description: 'Update twilio chat provider' })
  @ApiParam({ name: 'providerId', type: Number, required: true, description: 'Twilio chat provider ID' })
  @ApiBody({ description: 'Data for updating Twilio chat provider', type: UpdateTwilioProviderDto })
  @ApiOkResponse({ description: 'Twilio chat provider', type: TwilioProviderDto })
  @Put(':providerId')
  async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('providerId', ParseIntPipe) providerId: number,
    @Body() dto: UpdateTwilioProviderDto,
  ) {
    return this.service.update(accountId, providerId, dto);
  }

  @ApiOperation({ summary: 'Delete twilio chat provider', description: 'Delete twilio chat provider' })
  @ApiParam({ name: 'providerId', type: Number, required: true, description: 'Twilio chat provider ID' })
  @ApiOkResponse({ type: Boolean })
  @Delete(':providerId')
  async delete(
    @CurrentAuth() { accountId, userId }: AuthData,
    @Param('providerId', ParseIntPipe) providerId: number,
  ): Promise<boolean> {
    await this.service.delete({ accountId, userId, providerId });

    return true;
  }
}
