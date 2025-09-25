import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PagingQuery } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import {
  EntitySearchFilterDto,
  EntitySearchForCallResultDto,
  EntitySearchFullResultDto,
  EntitySearchResultDto,
} from './dto';
import { EntitySearchService } from './entity-search.service';

@ApiTags('crm/entities/search')
@Controller('crm/entities/search')
@JwtAuthorized({ prefetch: { user: true } })
export class EntitySearchController {
  constructor(private readonly service: EntitySearchService) {}

  @ApiOperation({
    summary: 'Search entities with full information',
    description: 'Search entities with full information by name according permissions',
  })
  @ApiBody({ type: EntitySearchFilterDto, required: true, description: 'Search filter' })
  @ApiOkResponse({ description: 'Entity search result', type: EntitySearchFullResultDto })
  @Post('full')
  async searchFull(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() filter: EntitySearchFilterDto,
    @Query() paging: PagingQuery,
  ) {
    return this.service.searchFull({ accountId, user, filter, paging });
  }

  @ApiOperation({ summary: 'Search entities', description: 'Search entities by name according permissions' })
  @ApiBody({ type: EntitySearchFilterDto, required: true, description: 'Search filter' })
  @ApiOkResponse({ description: 'Entity search result', type: EntitySearchResultDto })
  @Post()
  async search(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() filter: EntitySearchFilterDto,
    @Query() paging: PagingQuery,
  ) {
    return this.service.searchInfo({ accountId, user, filter, paging });
  }

  @ApiOperation({
    summary: 'Search entity for call info',
    description: 'Search entities for call information with last deal',
  })
  @ApiBody({ type: EntitySearchFilterDto, required: true, description: 'Search filter' })
  @ApiOkResponse({ description: 'Entity search result', type: EntitySearchForCallResultDto })
  @Post('for-call')
  async searchForCall(@CurrentAuth() { accountId, user }: AuthData, @Body() filter: EntitySearchFilterDto) {
    return this.service.searchForCall({ accountId, user, filter });
  }
}
