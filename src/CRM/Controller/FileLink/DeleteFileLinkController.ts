import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { FileLinkService } from '../../Service/FileLink/FileLinkService';

@ApiTags('crm/file-link')
@Controller()
@JwtAuthorized()
export class DeleteFileLinkController {
  constructor(private readonly fileLinkService: FileLinkService) {}

  @Delete('/crm/file-link/:fileLinkId')
  public async delete(@CurrentAuth() { accountId }: AuthData, @Param('fileLinkId', ParseIntPipe) fileLinkId: number) {
    await this.fileLinkService.deleteFileLink(accountId, fileLinkId);
  }
}
