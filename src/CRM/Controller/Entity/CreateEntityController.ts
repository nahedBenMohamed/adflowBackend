import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { EntityService } from '../../Service/Entity/EntityService';
import { CreateEntityDto } from '../../Service/Entity/Dto/CreateEntityDto';
import { EntityDto } from '../../Service/Entity/Dto/EntityDto';

@ApiTags('crm/entities')
@Controller()
@JwtAuthorized({ prefetch: { user: true } })
export class CreateEntityController {
  constructor(private service: EntityService) {}

  @ApiCreatedResponse({ description: 'Entity', type: EntityDto })
  @Post('/crm/entities')
  public async createEntity(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() dto: CreateEntityDto,
  ): Promise<EntityDto> {
    return this.service.createAndGetDto(accountId, user, dto);
  }
}
