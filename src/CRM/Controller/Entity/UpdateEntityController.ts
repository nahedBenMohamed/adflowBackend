import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { EntityService } from '../../Service/Entity/EntityService';
import { UpdateEntityDto } from '../../Service/Entity/Dto/UpdateEntityDto';
import { EntityDto } from '../../Service/Entity/Dto/EntityDto';

@ApiTags('crm/entities')
@Controller()
@JwtAuthorized({ prefetch: { user: true } })
export class UpdateEntityController {
  constructor(private entityService: EntityService) {}

  @ApiCreatedResponse({ description: 'Entity', type: EntityDto })
  @Patch('crm/entities/:id')
  async updateEntity(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEntityDto,
  ): Promise<EntityDto> {
    return this.entityService.updateAndGetDto(accountId, user, id, dto);
  }
}
