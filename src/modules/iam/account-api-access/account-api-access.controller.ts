import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { JwtAuthorized } from '../common/decorators/jwt-authorized.decorator';
import { CurrentAuth } from '../common/decorators/current-auth.decorator';
import { AuthData } from '../common/types/auth-data';

import { AccountApiAccessDto } from './dto';
import { AccountApiAccessService } from './account-api-access.service';

@ApiTags('IAM/account')
@Controller('account/api-access')
@JwtAuthorized({ access: { adminOnly: true } })
@TransformToDto()
export class AccountApiAccessController {
  constructor(private readonly service: AccountApiAccessService) {}

  @ApiOperation({ summary: 'Create account API access', description: 'Create account API access' })
  @ApiCreatedResponse({ type: AccountApiAccessDto, description: 'Created account API access' })
  @Post()
  public async create(@CurrentAuth() { accountId }: AuthData) {
    return this.service.create(accountId);
  }

  @ApiOperation({ summary: 'Get account API access', description: 'Get account API access' })
  @ApiOkResponse({ type: AccountApiAccessDto, description: 'Account API access' })
  @Get()
  public async findOne(@CurrentAuth() { accountId }: AuthData) {
    return await this.service.findOne({ accountId });
  }

  @ApiOperation({ summary: 'Recreate account API access', description: 'Recreate account API access' })
  @ApiOkResponse({ type: AccountApiAccessDto, description: 'Recreated account API access' })
  @Put()
  public async recreate(@CurrentAuth() { accountId }: AuthData) {
    return this.service.recreate(accountId);
  }

  @ApiOperation({ summary: 'Delete account API access', description: 'Delete account API access' })
  @ApiOkResponse()
  @Delete()
  public async delete(@CurrentAuth() { accountId }: AuthData) {
    return this.service.delete(accountId);
  }
}
