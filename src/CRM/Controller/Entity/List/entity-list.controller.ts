import { Body, Controller, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { PagingQuery } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { EntityBoardService } from '../../../Service/Entity/EntityBoardService';
import { EntityListItem } from '../../../Service/Entity/Dto/List/EntityListItem';
import { EntityListMeta } from '../../../Service/Entity/Dto/List/EntityListMeta';
import { UpdateEntitiesBatchFilterDto } from '../../../Service/Entity/Dto/Batch/update-entities-batch-filter.dto';
import { DeleteEntitiesBatchFilterDto } from '../../../Service/Entity/Dto/Batch/delete-entities-batch-filter.dto';
import { EntityBoardCardFilter } from '../Board/Filter/EntityBoardCardFilter';

@ApiTags('crm/entities/list')
@Controller('crm/entities/:entityTypeId/list')
@JwtAuthorized({ prefetch: { user: true } })
export class EntityListController {
  constructor(private readonly service: EntityBoardService) {}

  @ApiOperation({ summary: 'Get entities list', description: 'Get entities list' })
  @ApiParam({ name: 'entityTypeId', type: Number, required: true, description: 'Entity type ID' })
  @ApiQuery({ name: 'boardId', type: Number, required: false, description: 'Board ID' })
  @ApiBody({ type: EntityBoardCardFilter, description: 'Filter' })
  @ApiOkResponse({ description: 'Entities', type: [EntityListItem] })
  @Post()
  async getEntityListItems(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Query('boardId') boardId: number | null,
    @Body() filter: EntityBoardCardFilter,
    @Query() paging: PagingQuery,
  ): Promise<EntityListItem[]> {
    return this.service.getEntityListItems({ accountId, user, entityTypeId, boardId, filter, paging });
  }

  @ApiOperation({ summary: 'Get meta for list', description: 'Get meta for list' })
  @ApiParam({ name: 'entityTypeId', type: Number, required: true, description: 'Entity type ID' })
  @ApiQuery({ name: 'boardId', type: Number, required: false, description: 'Board ID' })
  @ApiBody({ type: EntityBoardCardFilter, description: 'Filter' })
  @ApiOkResponse({ description: 'Meta for list', type: EntityListMeta })
  @Post('meta')
  async getEntityListMeta(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Query('boardId') boardId: number | null,
    @Body() filter: EntityBoardCardFilter,
  ): Promise<EntityListMeta> {
    return this.service.getEntityListMeta({ accountId, user, entityTypeId, boardId, filter });
  }

  @ApiOperation({ summary: 'Update entities', description: 'Update entities' })
  @ApiParam({ name: 'entityTypeId', type: Number, required: true, description: 'Entity type ID' })
  @ApiQuery({ name: 'boardId', type: Number, required: false, description: 'Board ID' })
  @ApiBody({ type: UpdateEntitiesBatchFilterDto, description: 'Update data' })
  @ApiOkResponse({ description: 'Updated entities count', type: Number })
  @Post('update')
  async update(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Query('boardId') boardId: number | null,
    @Body() dto: UpdateEntitiesBatchFilterDto,
  ): Promise<number> {
    return this.service.batchUpdate({ accountId, user, entityTypeId, boardId, dto });
  }

  @ApiOperation({ summary: 'Delete entities', description: 'Delete entities' })
  @ApiParam({ name: 'entityTypeId', type: Number, required: true, description: 'Entity type ID' })
  @ApiQuery({ name: 'boardId', type: Number, required: false, description: 'Board ID' })
  @ApiBody({ type: DeleteEntitiesBatchFilterDto, description: 'Delete data' })
  @ApiOkResponse({ description: 'Delete entity list', type: Number })
  @Post('delete')
  async delete(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Query('boardId') boardId: number | null,
    @Body() dto: DeleteEntitiesBatchFilterDto,
  ): Promise<number> {
    return this.service.batchDelete({ accountId, user, entityTypeId, boardId, dto });
  }

  @ApiOperation({ summary: 'Get entity for list', description: 'Get entity for list' })
  @ApiParam({ name: 'entityTypeId', type: Number, required: true, description: 'Entity type ID' })
  @ApiParam({ name: 'entityId', type: Number, required: true, description: 'Entity ID' })
  @ApiBody({ type: EntityBoardCardFilter, description: 'Filter' })
  @ApiOkResponse({ description: 'Entity for list', type: EntityListItem })
  @Post(':entityId')
  async getEntityListItem(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Body() filter: EntityBoardCardFilter,
  ): Promise<EntityListItem> {
    return this.service.getEntityListItem({ accountId, user, entityTypeId, entityId, filter });
  }
}
