import { Controller, Delete, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { SalesforceSettingsService } from '../../Service/Settings/SalesforceSettingsService';

@ApiTags('integration/salesforce/settings')
@Controller()
@JwtAuthorized()
export class DeleteSettingsController {
  constructor(private readonly settingsService: SalesforceSettingsService) {}

  @Delete('/integration/salesforce/settings/:id')
  public async createIntegration(@CurrentAuth() { accountId }: AuthData, @Param('id') id: string) {
    await this.settingsService.delete(accountId, id);
  }
}
