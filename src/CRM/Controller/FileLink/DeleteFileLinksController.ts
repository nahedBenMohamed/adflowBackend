import { Controller, Delete, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { FileLinkService } from '../../Service/FileLink/FileLinkService';

@ApiTags('crm/file-link')
@Controller()
@JwtAuthorized()
export class DeleteFileLinksController {
  constructor(private readonly fileLinkService: FileLinkService) {}

  @ApiCreatedResponse({ description: 'Delete file links by ids' })
  @Delete('/crm/file-links')
  public async delete(@CurrentAuth() { accountId }: AuthData, @Query('ids') ids: string): Promise<void> {
    const fileLinkIds = ids.split(',').map((id) => parseInt(id));
    await this.fileLinkService.deleteFileLinks(accountId, fileLinkIds);
  }
}
