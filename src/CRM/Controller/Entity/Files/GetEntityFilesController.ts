import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { FileLinkDto } from '../../../Service/FileLink/FileLinkDto';
import { EntityService } from '../../../Service/Entity/EntityService';

@ApiTags('crm/entities')
@Controller()
@JwtAuthorized({ prefetch: { account: true } })
export class GetEntityFilesController {
  constructor(private entityService: EntityService) {}

  @ApiOkResponse({ description: 'Entity files', type: [FileLinkDto] })
  @Get('/crm/entities/:id/files')
  public async getEntityFiles(
    @CurrentAuth() { account }: AuthData,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FileLinkDto[]> {
    return await this.entityService.getFileLinks(account, id);
  }
}
