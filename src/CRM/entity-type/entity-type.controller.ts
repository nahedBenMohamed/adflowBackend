import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { UserAccess } from '@/modules/iam/common/decorators/user-access.decorator';

import { EntityTypeDto, CreateEntityTypeDto, UpdateEntityTypeDto, UpdateEntityTypeFieldsDto } from './dto';
import { EntityTypeService } from './entity-type.service';

@ApiTags('crm/entity-types')
@Controller('crm/entity-types')
@JwtAuthorized({ prefetch: { user: true } })
export class EntityTypeController {
  constructor(private readonly service: EntityTypeService) {}

  @ApiOperation({ summary: 'Create entity type', description: 'Create entity type' })
  @ApiBody({ type: CreateEntityTypeDto, description: 'Data for creating entity type' })
  @ApiCreatedResponse({ description: 'Created entity type', type: EntityTypeDto })
  @Post()
  @UserAccess({ adminOnly: true })
  public async create(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() dto: CreateEntityTypeDto,
  ): Promise<EntityTypeDto> {
    return this.service.create(accountId, user, dto);
  }

  @ApiOperation({ summary: 'Get entity types', description: 'Get all entity types' })
  @ApiOkResponse({ description: 'Entity types', type: [EntityTypeDto] })
  @Get()
  public async getEntityTypes(@CurrentAuth() { accountId, user }: AuthData): Promise<EntityTypeDto[]> {
    return this.service.getDtosByAccountId(accountId, user);
  }

  @ApiOperation({ summary: 'Get entity type', description: 'Get entity type by id' })
  @ApiParam({ name: 'entityTypeId', description: 'Entity type ID', type: Number, required: true })
  @ApiOkResponse({ description: 'Entity type', type: EntityTypeDto })
  @Get(':entityTypeId')
  public async getEntityType(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
  ): Promise<EntityTypeDto> {
    return this.service.getDtoById(accountId, user, entityTypeId);
  }

  @ApiOperation({ summary: 'Update entity type', description: 'Update entity type' })
  @ApiParam({ name: 'entityTypeId', description: 'Entity type ID', type: Number, required: true })
  @ApiBody({ type: UpdateEntityTypeDto, description: 'Data for updating entity type' })
  @ApiOkResponse({ description: 'Updated entity type', type: EntityTypeDto })
  @Put(':entityTypeId')
  @UserAccess({ adminOnly: true })
  public async update(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Body() dto: UpdateEntityTypeDto,
  ): Promise<EntityTypeDto> {
    return this.service.update(accountId, user, entityTypeId, dto);
  }

  @ApiOperation({
    summary: 'Update entity type fields and groups',
    description: 'Update entity type fields and groups',
  })
  @ApiParam({ name: 'entityTypeId', description: 'Entity type ID', type: Number, required: true })
  @ApiBody({ type: UpdateEntityTypeFieldsDto, description: 'Data for updating entity type fields and groups' })
  @ApiOkResponse({ description: 'Updated entity type', type: EntityTypeDto })
  @Put(':entityTypeId/fields')
  @UserAccess({ adminOnly: true })
  public async updateEntityTypeFields(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
    @Body() dto: UpdateEntityTypeFieldsDto,
  ): Promise<EntityTypeDto> {
    return this.service.updateFields(accountId, user, entityTypeId, dto);
  }

  @ApiOperation({ summary: 'Delete entity type', description: 'Delete entity type' })
  @ApiParam({ name: 'entityTypeId', description: 'Entity type ID', type: Number, required: true })
  @ApiOkResponse()
  @Delete(':entityTypeId')
  @UserAccess({ adminOnly: true })
  public async delete(
    @CurrentAuth() { accountId, userId }: AuthData,
    @Param('entityTypeId', ParseIntPipe) entityTypeId: number,
  ) {
    await this.service.delete(accountId, userId, entityTypeId);
  }
}
