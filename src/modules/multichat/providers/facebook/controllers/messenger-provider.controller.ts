import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { AuthDataPrefetch } from '@/modules/iam/common/decorators/auth-data-prefetch.decorator';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { MessengerProviderDto, CreateMessengerProviderDto, UpdateMessengerProviderDto } from '../dto';
import { MessengerProviderService } from '../messenger-provider.service';

@ApiTags('multichat/settings/messenger')
@Controller('chat/settings/providers/messenger')
@JwtAuthorized()
@TransformToDto()
export class MessengerProviderController {
  constructor(private readonly service: MessengerProviderService) {}

  @ApiOperation({ summary: 'Get Facebook Auth redirect url', description: 'Get Facebook Auth redirect url' })
  @ApiQuery({ name: 'display', type: String, required: false, description: 'Facebook OAuth screen display type' })
  @ApiOkResponse({ description: 'Facebook Auth redirect url', type: String })
  @Get('auth/connect')
  async connect(
    @CurrentAuth() { accountId, userId }: AuthData,
    @Query('display') display: string | undefined,
  ): Promise<string> {
    return this.service.getConnectUrl(accountId, userId, display);
  }

  @ApiOperation({
    summary: 'Create Facebook Messenger chat provider',
    description: 'Create Facebook Messenger chat provider',
  })
  @ApiBody({ description: 'Data for creating Facebook Messenger chat provider', type: CreateMessengerProviderDto })
  @ApiCreatedResponse({ description: 'Facebook Messenger chat provider', type: MessengerProviderDto })
  @Post()
  async create(@CurrentAuth() { accountId, userId }: AuthData, @Body() dto: CreateMessengerProviderDto) {
    return this.service.create(accountId, userId, dto);
  }

  @ApiOperation({
    summary: 'Get Facebook Messenger chat providers with settings',
    description: 'Get Facebook Messenger chat providers with settings',
  })
  @ApiOkResponse({ description: 'Facebook Messenger chat providers', type: [MessengerProviderDto] })
  @AuthDataPrefetch({ user: true })
  @Get()
  async getProviders(@CurrentAuth() { accountId, user }: AuthData) {
    return this.service.getProvidersWithSettings(accountId, user);
  }

  @ApiOperation({
    summary: 'Get Facebook Messenger chat provider with settings',
    description: 'Get Facebook Messenger chat provider with settings',
  })
  @ApiParam({ name: 'providerId', type: Number, required: true, description: 'Facebook Messenger chat provider ID' })
  @ApiOkResponse({ description: 'Facebook Messenger chat provider', type: MessengerProviderDto })
  @Get(':providerId')
  async getProvider(@CurrentAuth() { accountId }: AuthData, @Param('providerId', ParseIntPipe) providerId: number) {
    return this.service.getProviderWithSettings(accountId, providerId);
  }

  @ApiOperation({
    summary: 'Update Facebook Messenger chat provider',
    description: 'Update Facebook Messenger chat provider',
  })
  @ApiParam({ name: 'providerId', type: Number, required: true, description: 'Facebook Messenger chat provider ID' })
  @ApiBody({ description: 'Data for updating Facebook Messenger chat provider', type: UpdateMessengerProviderDto })
  @ApiOkResponse({ description: 'Facebook Messenger chat provider', type: MessengerProviderDto })
  @Put(':providerId')
  async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('providerId', ParseIntPipe) providerId: number,
    @Body() dto: UpdateMessengerProviderDto,
  ) {
    return this.service.update(accountId, providerId, dto);
  }

  @ApiOperation({
    summary: 'Delete Facebook Messenger chat provider',
    description: 'Delete Facebook Messenger chat provider',
  })
  @ApiParam({ name: 'providerId', type: Number, required: true, description: 'Facebook Messenger chat provider ID' })
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
