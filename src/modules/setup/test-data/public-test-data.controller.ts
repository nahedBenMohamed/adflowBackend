import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { UrlGeneratorService } from '@/common';
import { ApiAccessRequired } from '@/modules/iam/common/decorators/api-access-required.decorator';

import { TestDataService } from './test-data.service';
import { CreateTestAccountsQuery } from './dto/create-test-accounts-query';

@ApiExcludeController(true)
@Controller('/setup/test-data')
export class PublicTestDataController {
  constructor(
    private readonly service: TestDataService,
    private readonly urlGeneratorService: UrlGeneratorService,
  ) {}

  @Get('account/create')
  @ApiAccessRequired()
  public async createTestAccounts(@Query() query: CreateTestAccountsQuery) {
    await this.service.createTestAccounts(query);
  }

  @Redirect()
  @Get('account/login')
  public async loginTestUser() {
    const link = await this.service.loginTestUser();
    const url = link
      ? this.urlGeneratorService.createUrl({
          route: 'login-link',
          subdomain: link.subdomain,
          query: { loginLink: link.loginLink },
        })
      : this.urlGeneratorService.createUrl();

    return { url, statusCode: 302 };
  }
}
