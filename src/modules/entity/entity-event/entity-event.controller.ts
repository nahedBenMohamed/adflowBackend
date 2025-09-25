import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { PagingQuery, TransformToDto } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { GetEntityEventResult } from './dto';
import { EntityEventFilter } from './enums';
import { EntityEventService } from './entity-event.service';

@ApiTags('crm/entity-event')
@Controller('crm/entities/:entityId/events')
@JwtAuthorized({ prefetch: { account: true, user: true } })
@TransformToDto()
export class EntityEventController {
  constructor(private readonly service: EntityEventService) {}

  @ApiCreatedResponse({ description: 'EntityEvents', type: GetEntityEventResult })
  @Get(':filter')
  public async getEntityEventItems(
    @CurrentAuth() { account, user }: AuthData,
    @Param('entityId', ParseIntPipe) entityId: number,
    //TODO Unify query interface, move filters from parameters to query body
    @Param('filter') filter: EntityEventFilter,
    @Query() paging: PagingQuery,
  ): Promise<GetEntityEventResult> {
    return this.service.findEntityEventItems(account, user, entityId, filter, paging);
  }
}
