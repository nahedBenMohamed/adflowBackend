import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { AuthDataPrefetch } from '@/modules/iam/common/decorators/auth-data-prefetch.decorator';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { WazzupProviderDto, CreateWazzupProviderDto, UpdateWazzupProviderDto, WazzupChannelDto } from '../dto';
import { WazzupProviderService } from '../wazzup-provider.service';

@ApiTags('multichat/settings/wazzup')
@Controller('chat/settings/providers/wazzup')
@JwtAuthorized()
@TransformToDto()
export class WazzupProviderController {
  constructor(private readonly service: WazzupProviderService) {}

  @ApiOperation({ summary: 'Create Wazzup chat provider', description: 'Create Wazzup chat provider' })
  @ApiBody({ description: 'Data for creating Wazzup chat provider', type: CreateWazzupProviderDto })
  @ApiCreatedResponse({ description: 'Wazzup chat provider', type: WazzupProviderDto })
  @AuthDataPrefetch({ account: true })
  @Post()
  async create(@CurrentAuth() { account, userId }: AuthData, @Body() dto: CreateWazzupProviderDto) {
    return this.service.create(account, userId, dto);
  }

  @ApiOperation({ summary: 'Get Wazzup API key', description: 'Get Wazzup API key' })
  @ApiQuery({ name: 'state', type: String, required: true, description: 'State' })
  @ApiOkResponse({ description: 'Wazzup API key', type: String })
  @AuthDataPrefetch({ account: true })
  @Get('api-key')
  async getApiKey(@CurrentAuth() { account }: AuthData, @Query('state') state: string) {
    return this.service.getApiKey(account, state);
  }

  @ApiOperation({ summary: 'Get Wazzup channels', description: 'Get Wazzup channels' })
  @ApiQuery({ name: 'apiKey', type: String, required: true, description: 'API key' })
  @ApiOkResponse({ description: 'Wazzup channels', type: [WazzupChannelDto] })
  @Get('channels')
  async findChannels(@CurrentAuth() { accountId }: AuthData, @Query('apiKey') apiKey: string) {
    return this.service.findChannels(accountId, apiKey);
  }

  @ApiOperation({ summary: 'Get Wazzup chat providers', description: 'Get Wazzup chat providers' })
  @ApiOkResponse({ description: 'Wazzup chat providers', type: [WazzupProviderDto] })
  @AuthDataPrefetch({ user: true })
  @Get()
  async findMany(@CurrentAuth() { accountId, user }: AuthData) {
    return this.service.findMany(accountId, user);
  }

  @ApiOperation({ summary: 'Get Wazzup chat provider', description: 'Get Wazzup chat provider' })
  @ApiParam({ name: 'providerId', description: 'Wazzup chat provider ID', type: Number, required: true })
  @ApiOkResponse({ description: 'Wazzup chat provider', type: WazzupProviderDto })
  @Get(':providerId')
  async findOne(@CurrentAuth() { accountId }: AuthData, @Param('providerId', ParseIntPipe) providerId: number) {
    return this.service.findOne(accountId, providerId);
  }

  @ApiOperation({ summary: 'Update Wazzup chat provider', description: 'Update Wazzup chat provider' })
  @ApiParam({ name: 'providerId', description: 'Wazzup chat provider ID', type: Number, required: true })
  @ApiBody({ description: 'Data for updating Wazzup chat provider', type: UpdateWazzupProviderDto })
  @ApiOkResponse({ description: 'Wazzup chat provider', type: WazzupProviderDto })
  @Patch(':providerId')
  async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('providerId', ParseIntPipe) providerId: number,
    @Body() dto: UpdateWazzupProviderDto,
  ) {
    return this.service.update(accountId, providerId, dto);
  }

  @ApiOperation({ summary: 'Delete Wazzup chat provider', description: 'Delete Wazzup chat provider' })
  @ApiParam({ name: 'providerId', description: 'Wazzup chat provider ID', type: Number, required: true })
  @ApiOkResponse({ description: 'Success', type: Boolean })
  @Delete(':providerId')
  async delete(
    @CurrentAuth() { accountId, userId }: AuthData,
    @Param('providerId', ParseIntPipe) providerId: number,
  ): Promise<boolean> {
    await this.service.delete({ accountId, userId, providerId });

    return true;
  }
}
