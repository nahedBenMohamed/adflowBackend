import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { EntityInfoDto } from './dto';
import { EntityInfoService } from './entity-info.service';

@ApiTags('crm/entities')
@Controller('crm/entities/:entityId/info')
@JwtAuthorized({ prefetch: { user: true } })
export class EntityInfoController {
  constructor(private readonly service: EntityInfoService) {}

  @ApiOperation({ summary: 'Get entity info', description: 'Get entity info' })
  @ApiParam({ name: 'entityId', description: 'Entity ID', type: Number, required: true })
  @ApiOkResponse({ description: 'Entity info', type: EntityInfoDto })
  @Get()
  async findOne(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityId', ParseIntPipe) entityId: number,
  ): Promise<EntityInfoDto> {
    return this.service.findOne({ accountId, user, entityId });
  }
}
