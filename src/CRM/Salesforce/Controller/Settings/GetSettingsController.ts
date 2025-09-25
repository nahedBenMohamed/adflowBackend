import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { SalesforceSettingsService } from '../../Service/Settings/SalesforceSettingsService';
import { SalesforceSettingsDto } from '../../Service/Settings/SalesforceSettingsDto';

@ApiTags('integration/salesforce/settings')
@Controller()
@JwtAuthorized()
export class GetSettingsController {
  constructor(private readonly settingsService: SalesforceSettingsService) {}

  @Get('/integration/salesforce/settings')
  @ApiOkResponse({ description: 'SalesForce settings for account', type: [SalesforceSettingsDto] })
  public async createIntegration(@CurrentAuth() { accountId }: AuthData): Promise<SalesforceSettingsDto[]> {
    const allSettings = await this.settingsService.getAll(accountId);
    return allSettings.map((settings) => SalesforceSettingsDto.create(settings));
  }
}
