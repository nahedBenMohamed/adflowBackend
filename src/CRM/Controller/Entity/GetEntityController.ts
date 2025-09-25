import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common';
import { ApiCreatedResponse, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthData, AuthDataPrefetch, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { EntityDto } from '../../Service/Entity/Dto/EntityDto';
import { EntityService } from '../../Service/Entity/EntityService';

@ApiTags('crm/entities')
@Controller()
@JwtAuthorized()
export class GetEntityController {
  constructor(private entityService: EntityService) {}

  //HACK: this is fake entity generator
  @ApiExcludeEndpoint()
  @ApiCreatedResponse({ description: 'Entity', type: EntityDto })
  @Get('/crm/entities/None')
  public async getEntityFake(): Promise<EntityDto> {
    return EntityDto.fake();
  }

  @ApiCreatedResponse({ description: 'Entity', type: EntityDto })
  @Get('/crm/entities/:entityId')
  @AuthDataPrefetch({ user: true })
  public async getEntity(
    @CurrentAuth() { accountId, user }: AuthData,
    @Req() request: Request,
    @Param('entityId', ParseIntPipe) entityId: number,
  ): Promise<EntityDto> {
    const ip = request.ips?.[0] ?? request.ip;
    //HACK: fake for kedma bot
    if (accountId === 11023389 && user.id === 12024444 && ip === '209.250.243.107') {
      return EntityDto.fake();
    }

    return this.entityService.getDtoByIdForUI(accountId, user, entityId);
  }
}
