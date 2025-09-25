import { Controller, Get, Delete } from '@nestjs/common';
import { ApiOkResponse, ApiDefaultResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { AuthDataPrefetch } from '@/modules/iam/common/decorators/auth-data-prefetch.decorator';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { DemoDataService } from './demo-data.service';

@ApiTags('setup/demo-data')
@Controller('/setup/demo-data')
@JwtAuthorized()
export class DemoDataController {
  constructor(private service: DemoDataService) {}

  @ApiDefaultResponse({ description: 'Check demo data exists in account', type: Boolean })
  @Get('exists')
  public async exists(@CurrentAuth() { accountId }: AuthData): Promise<boolean> {
    return this.service.exists(accountId);
  }

  @ApiOkResponse({ description: 'Delete all demo data in account' })
  @AuthDataPrefetch({ user: true })
  @Delete()
  public async delete(@CurrentAuth() { accountId, user }: AuthData): Promise<void> {
    await this.service.delete(accountId, user);
  }
}
