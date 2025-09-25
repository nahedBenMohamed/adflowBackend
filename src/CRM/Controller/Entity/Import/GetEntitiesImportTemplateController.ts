import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { ImportService } from '../../../Service/Import/ImportService';

@ApiTags('crm/entities/import')
@Controller()
@JwtAuthorized()
export class GetEntitiesImportTemplateController {
  constructor(private importService: ImportService) {}

  @Get('/crm/entities/:entityTypeId/import/template')
  @ApiOkResponse({ description: 'Get import template for entityType', type: StreamableFile })
  async getTemplate(
    @CurrentAuth() { accountId }: AuthData,
    @Param('entityTypeId') entityTypeId: number,
    @Res() res: Response,
  ) {
    const content = await this.importService.generateTemplateForEntityType(accountId, entityTypeId);

    res.setHeader('Content-Disposition', `attachment; filename="import-template.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.send(content);
  }
}
