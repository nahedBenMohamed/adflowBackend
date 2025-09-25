import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { FileLinkSource } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { FileLinkService } from '../../../Service/FileLink/FileLinkService';
import { FileLinkDto } from '../../../Service/FileLink/FileLinkDto';
import { AddEntityFilesDto } from '../../../Service/Entity/Dto/Files/AddEntityFilesDto';

@ApiTags('crm/entities')
@Controller()
@JwtAuthorized({ prefetch: { account: true } })
export class AddEntityFilesController {
  constructor(private fileLinkService: FileLinkService) {}

  @ApiOkResponse({ description: 'Added entity files', type: [FileLinkDto] })
  @Post('/crm/entities/:id/files')
  public async addEntityFiles(
    @CurrentAuth() { account }: AuthData,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddEntityFilesDto,
  ): Promise<FileLinkDto[]> {
    return await this.fileLinkService.addFiles(account, FileLinkSource.ENTITY, id, dto.fileIds);
  }
}
