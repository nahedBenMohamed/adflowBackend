import { Body, Controller, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { PagingQuery } from '@/common';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { EntityBoardService } from '../../../Service/Entity/EntityBoardService';
import { EntityBoardCard } from '../../../Service/Entity/Dto/Board/EntityBoardCard';
import { EntityBoardMeta } from '../../../Service/Entity/Dto/Board/EntityBoardMeta';
import { EntitySimpleDto } from '../../../Service/Entity/Dto/EntitySimpleDto';

import { EntityBoardCardFilter } from './Filter/EntityBoardCardFilter';

@ApiTags('crm/entities/board')
@Controller('crm/entities/:entityTypeId/board/:boardId')
@JwtAuthorized({ prefetch: { user: true } })
export class EntityBoardController {
  constructor(private readonly service: EntityBoardService) {}

  @ApiOperation({ summary: 'Get entities list for board', description: 'Get entities list for board' })
  @ApiParam({ name: 'entityTypeId', type: Number, required: true, description: 'Entity type ID' })
  @ApiParam({ name: 'boardId', type: Number, required: true, description: 'Board ID' })
  @ApiBody({ type: EntityBoardCardFilter, description: 'Filter' })
  @ApiOkResponse({ description: 'Entities for board', type: [EntityBoardCard] })
  @Post('cards')
  async getEntityBoardCards(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() filter: EntityBoardCardFilter,
    @Query() paging: PagingQuery,
  ): Promise<EntityBoardCard[]> {
    return this.service.getEntityBoardCards({ accountId, user, entityTypeId, boardId, filter, paging });
  }

  @ApiOperation({ summary: 'Get entity for board', description: 'Get entity for board' })
  @ApiParam({ name: 'entityTypeId', type: Number, required: true, description: 'Entity type ID' })
  @ApiParam({ name: 'boardId', type: Number, required: true, description: 'Board ID' })
  @ApiParam({ name: 'entityId', type: Number, required: true, description: 'Entity ID' })
  @ApiBody({ type: EntityBoardCardFilter, description: 'Filter' })
  @ApiOkResponse({ description: 'Entity for board', type: EntityBoardCard })
  @Post('cards/:entityId')
  async getEntityBoardCard(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Body() filter: EntityBoardCardFilter,
  ): Promise<EntityBoardCard | null> {
    return this.service.getEntityBoardCard({ accountId, user, entityTypeId, boardId, entityId, filter });
  }

  /**
   * @deprecated create find entity endpoint
   */
  @ApiOkResponse({ description: 'Get entities simple info list for report filter', type: [EntitySimpleDto] })
  @Post('entities')
  async getEntityBoardEntities(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query() paging: PagingQuery,
  ): Promise<EntitySimpleDto[]> {
    const entities = await this.service.getEntityBoardEntities(accountId, user, entityTypeId, boardId, paging);

    return plainToInstance(EntitySimpleDto, entities, { excludeExtraneousValues: true });
  }

  @ApiOperation({ summary: 'Get meta for board', description: 'Get meta for board' })
  @ApiParam({ name: 'entityTypeId', type: Number, required: true, description: 'Entity type ID' })
  @ApiParam({ name: 'boardId', type: Number, required: true, description: 'Board ID' })
  @ApiBody({ type: EntityBoardCardFilter, description: 'Filter' })
  @ApiOkResponse({ description: 'Meta for board', type: EntityBoardMeta })
  @Post('meta')
  async getEntityBoardMeta(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() filter: EntityBoardCardFilter,
  ): Promise<EntityBoardMeta> {
    return this.service.getEntityBoardMeta({ accountId, user, entityTypeId, boardId, filter });
  }
}
