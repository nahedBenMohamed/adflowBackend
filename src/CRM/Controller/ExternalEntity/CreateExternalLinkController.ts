import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiExcludeController } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { ExternalEntityService } from '../../Service/ExternalEntity/ExternalEntityService';
import { CreateExternalEntityDto } from '../../Service/ExternalEntity/CreateExternalEntityDto';
import { CreateExternalEntityResult } from '../../Service/ExternalEntity/CreateExternalEntityResult';

@ApiExcludeController(true)
@Controller()
@JwtAuthorized({ prefetch: { account: true, user: true } })
export class CreateExternalLinkController {
  constructor(private readonly service: ExternalEntityService) {}

  @ApiCreatedResponse({ description: 'Entity', type: CreateExternalEntityResult })
  @Post('/extension/external-link')
  public async createExternalLink(
    @CurrentAuth() { account, user }: AuthData,
    @Body() dto: CreateExternalEntityDto,
  ): Promise<CreateExternalEntityResult> {
    return await this.service.create(account, user, dto);
  }
}
