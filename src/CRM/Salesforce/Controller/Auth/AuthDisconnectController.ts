import { Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { SalesforceIntegrationService } from '../../Service/SalesforceIntegrationService';

@ApiTags('integration/salesforce')
@Controller()
@JwtAuthorized()
export class AuthDisconnectController {
  constructor(private readonly integrationService: SalesforceIntegrationService) {}

  @Post('/integration/salesforce/auth/disconnect/:id')
  public async connect(@CurrentAuth() { accountId }: AuthData, @Param('id') id: string) {
    return await this.integrationService.disconnect(accountId, id);
  }
}
