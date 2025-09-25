import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { EntityService } from '../../Service/Entity/EntityService';

@ApiTags('crm/entities')
@Controller()
@JwtAuthorized({ prefetch: { user: true } })
export class DeleteEntityController {
  constructor(private readonly service: EntityService) {}

  @Delete('crm/entities/:entityId')
  async delete(@CurrentAuth() { accountId, user }: AuthData, @Param('entityId', ParseIntPipe) entityId: number) {
    await this.service.delete(accountId, user, entityId);
  }
}
