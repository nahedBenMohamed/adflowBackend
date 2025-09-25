import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { Subdomain } from '@/common';

import { SalesforceIntegrationService } from '../../Service/SalesforceIntegrationService';

@ApiExcludeController(true)
@Controller()
export class AuthCallbackController {
  constructor(private readonly integrationService: SalesforceIntegrationService) {}

  @Redirect()
  @Get('/integration/salesforce/auth/callback')
  public async callback(
    @Subdomain() subdomain: string | null,
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const redirectUrl = await this.integrationService.processAuthCode(subdomain, code, state);

    return { url: redirectUrl, statusCode: 302 };
  }
}
