import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { EntityInfoDto } from '@/modules/entity/entity-info';

import { EntityService } from '../../Service/Entity/EntityService';
import { CreateSimpleEntityDto } from '../../Service/Entity/Dto/CreateSimpleEntityDto';

@ApiTags('crm/entities')
@Controller()
@JwtAuthorized({ prefetch: { user: true } })
export class CreateSimpleEntityController {
  constructor(private readonly service: EntityService) {}

  @ApiCreatedResponse({ description: 'Entities', type: [EntityInfoDto] })
  @Post('/crm/entities/simple')
  public async createEntity(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() dto: CreateSimpleEntityDto,
  ): Promise<EntityInfoDto[]> {
    return this.service.createSimpleAndGetInfo({ accountId, user, dto });
  }
}
