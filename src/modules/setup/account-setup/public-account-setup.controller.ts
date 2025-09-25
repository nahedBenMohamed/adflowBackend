import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { ApiAccessRequired } from '@/modules/iam/common/decorators/api-access-required.decorator';
import { GAClientId } from '@/modules/iam/common/decorators/ga-client-id.decorator';
import { LoginLinkDto } from '@/modules/iam/authentication/dto/login-link.dto';

import { SetupAccountDto } from './dto';
import { AccountSetupService } from './account-setup.service';

@ApiTags('setup/account')
@Controller('setup/account')
@ApiAccessRequired()
export class PublicAccountSetupController {
  constructor(private readonly service: AccountSetupService) {}

  @ApiCreatedResponse({ type: LoginLinkDto })
  @Post()
  async create(@GAClientId() gaClientId: string, @Body() dto: SetupAccountDto): Promise<LoginLinkDto> {
    return this.service.create(dto, gaClientId);
  }
}
