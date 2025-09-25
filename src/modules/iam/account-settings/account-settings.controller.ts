import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { JwtAuthorized, CurrentAuth, AuthData, UserAccess } from '../common';
import { AccountSettingsDto, UpdateAccountSettingsDto } from './dto';
import { AccountSettingsService } from './account-settings.service';

@ApiTags('IAM/account')
@Controller('account/settings')
@JwtAuthorized()
@TransformToDto()
export class AccountSettingsController {
  constructor(private readonly service: AccountSettingsService) {}

  @ApiCreatedResponse({ type: AccountSettingsDto })
  @Get()
  async get(@CurrentAuth() { accountId }: AuthData) {
    return await this.service.getOne(accountId);
  }

  @ApiCreatedResponse({ type: AccountSettingsDto })
  @Put()
  @UserAccess({ adminOnly: true })
  async update(@CurrentAuth() { accountId }: AuthData, @Body() dto: UpdateAccountSettingsDto) {
    return this.service.update(accountId, dto);
  }
}
