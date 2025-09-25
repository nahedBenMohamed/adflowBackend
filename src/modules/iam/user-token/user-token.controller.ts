import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { Subdomain, TransformToDto } from '@/common';

import { AuthData, CurrentAuth, JwtAuthorized } from '../common';

import { CreateUserTokenDto, UserAccessTokenDto, UserTokenDto } from './dto';
import { UserTokenService } from './user-token.service';

@ApiTags('IAM/users/tokens')
@Controller('users/my/tokens')
@JwtAuthorized()
@TransformToDto()
export class UserTokenController {
  constructor(private readonly service: UserTokenService) {}

  @ApiOperation({ summary: 'Create user access token', description: 'Create user access token' })
  @ApiBody({ type: CreateUserTokenDto, required: true, description: 'Create user access token data' })
  @ApiCreatedResponse({ type: UserAccessTokenDto, description: 'Created user access token' })
  @Post()
  async create(
    @CurrentAuth() { accountId, userId }: AuthData,
    @Subdomain() subdomain: string | null,
    @Body() dto: CreateUserTokenDto,
  ) {
    return this.service.create({ accountId, userId, subdomain, dto });
  }

  @ApiOperation({ summary: 'Get user access token', description: 'Get user access token' })
  @ApiParam({ name: 'tokenId', type: Number, description: 'User access token id', required: true })
  @ApiOkResponse({ type: UserTokenDto, description: 'User access token' })
  @Get(':tokenId')
  async findOne(@CurrentAuth() { accountId, userId }: AuthData, @Param('tokenId', ParseIntPipe) tokenId: number) {
    return this.service.findOne({ accountId, userId, tokenId });
  }

  @ApiOperation({ summary: 'Get user access tokens', description: 'Get user access tokens' })
  @ApiOkResponse({ type: [UserTokenDto], description: 'User access tokens' })
  @Get()
  async findMany(@CurrentAuth() { accountId, userId }: AuthData) {
    return this.service.findMany({ accountId, userId });
  }

  @ApiOperation({ summary: 'Delete user access token', description: 'Delete user access token' })
  @ApiParam({ name: 'tokenId', type: Number, description: 'User access token id', required: true })
  @ApiOkResponse({ type: Number, description: 'Deleted user access token id' })
  @Delete(':tokenId')
  async delete(@CurrentAuth() { accountId, userId }: AuthData, @Param('tokenId', ParseIntPipe) tokenId: number) {
    return this.service.delete({ accountId, userId, tokenId });
  }
}
