import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData, AuthDataPrefetch, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { VoximplantAccountDto } from './dto';
import { VoximplantAccountService } from './voximplant-account.service';

@ApiTags('telephony/voximplant/account')
@Controller('account')
@JwtAuthorized()
@TransformToDto()
export class VoximplantAccountController {
  constructor(private service: VoximplantAccountService) {}

  @AuthDataPrefetch({ account: true })
  @ApiCreatedResponse({ description: 'Create voximplant account', type: VoximplantAccountDto })
  @Post()
  public async create(@CurrentAuth() { account }: AuthData) {
    return this.service.create(account);
  }

  @ApiCreatedResponse({ description: 'Get linked voximplant account', type: VoximplantAccountDto })
  @Get()
  public async findOne(@CurrentAuth() { accountId }: AuthData) {
    return this.service.findOne(accountId);
  }

  @ApiCreatedResponse({ description: 'Delete voximplant account' })
  @Delete()
  public async delete(@CurrentAuth() { accountId }: AuthData) {
    return this.service.markActive(accountId, false);
  }
}
