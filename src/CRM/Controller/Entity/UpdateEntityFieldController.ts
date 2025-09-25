import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { CreateFieldValueDto } from '@/modules/entity/entity-field/field-value/dto/create-field-value.dto';
import { EntityService } from '../../Service/Entity/EntityService';

@ApiTags('crm/fields')
@Controller()
@JwtAuthorized({ prefetch: { user: true } })
export class UpdateEntityFieldController {
  constructor(private readonly service: EntityService) {}

  @ApiOkResponse({ description: 'Set entity field value' })
  @Post('/crm/entities/:entityId/field-values/:fieldId')
  public async updateFieldValue(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Body() dto: CreateFieldValueDto,
  ) {
    await this.service.updateFieldValue(accountId, user, entityId, fieldId, dto);
  }
}
