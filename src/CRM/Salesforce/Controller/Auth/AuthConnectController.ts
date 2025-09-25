import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { SalesforceIntegrationService } from '../../Service/SalesforceIntegrationService';

@ApiTags('integration/salesforce')
@Controller()
@JwtAuthorized({ prefetch: { account: true } })
export class AuthConnectController {
  constructor(private readonly integrationService: SalesforceIntegrationService) {}

  @Get('/integration/salesforce/auth/connect/:id')
  public async connect(@CurrentAuth() { account }: AuthData, @Param('id') id: string) {
    return await this.integrationService.getAuthorizeUrl(account.subdomain, id);
  }
}
