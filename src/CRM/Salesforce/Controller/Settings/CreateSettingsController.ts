import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { SalesforceSettingsService } from '../../Service/Settings/SalesforceSettingsService';
import { CreateSalesforceSettingsDto } from '../../Service/Settings/CreateSalesforceSettingsDto';
import { SalesforceSettingsDto } from '../../Service/Settings/SalesforceSettingsDto';

@ApiTags('integration/salesforce/settings')
@Controller()
@JwtAuthorized()
export class CreateSettingsController {
  constructor(private readonly settingsService: SalesforceSettingsService) {}

  @Post('/integration/salesforce/settings')
  @ApiCreatedResponse({ description: 'SalesForce settings', type: SalesforceSettingsDto })
  public async createIntegration(
    @CurrentAuth() { accountId }: AuthData,
    @Body() dto: CreateSalesforceSettingsDto,
  ): Promise<SalesforceSettingsDto> {
    const settings = await this.settingsService.create(accountId, dto);
    return SalesforceSettingsDto.create(settings);
  }
}
