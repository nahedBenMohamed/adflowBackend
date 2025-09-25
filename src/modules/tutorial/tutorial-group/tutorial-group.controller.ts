import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { ExpandQuery, SortOrderListDto, TransformToDto } from '@/common';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { UserAccess } from '@/modules/iam/common/decorators/user-access.decorator';
import { AuthData } from '@/modules/iam/common/types/auth-data';

import { TutorialFilterDto } from '../common';
import { ExpandableField } from './types';
import { TutorialGroupDto, CreateTutorialGroupDto, UpdateTutorialGroupDto } from './dto';
import { TutorialGroupService } from './tutorial-group.service';

@ApiTags('tutorial/groups')
@Controller('groups')
@JwtAuthorized()
@TransformToDto()
export class TutorialGroupController {
  constructor(private readonly service: TutorialGroupService) {}

  @ApiOperation({ summary: 'Create tutorial group', description: 'Create tutorial group' })
  @ApiBody({ type: CreateTutorialGroupDto, required: true, description: 'Data for creating tutorial group' })
  @ApiCreatedResponse({ description: 'Created tutorial group', type: TutorialGroupDto })
  @Post()
  @UserAccess({ adminOnly: true })
  public async create(@CurrentAuth() { accountId }: AuthData, @Body() dto: CreateTutorialGroupDto) {
    return this.service.create(accountId, dto);
  }

  @ApiOperation({ summary: 'Get tutorial groups', description: 'Get tutorial groups' })
  @ApiQuery({
    name: 'expand',
    type: String,
    required: false,
    isArray: true,
    description: 'Expand fields',
    enum: ExpandableField,
  })
  @ApiOkResponse({ description: 'Tutorial groups', type: [TutorialGroupDto] })
  @Get()
  public async findMany(
    @CurrentAuth() { accountId }: AuthData,
    @Query() filter: TutorialFilterDto,
    @Query() expand: ExpandQuery<ExpandableField>,
  ) {
    return this.service.findMany(accountId, filter, { expand: expand.fields });
  }

  @ApiOperation({ summary: 'Get tutorial group', description: 'Get tutorial group' })
  @ApiParam({ name: 'groupId', type: Number, required: true, description: 'Tutorial group id', example: 1 })
  @ApiQuery({
    name: 'expand',
    type: String,
    required: false,
    isArray: true,
    description: 'Expand fields',
    enum: ExpandableField,
  })
  @ApiOkResponse({ description: 'Tutorial group', type: TutorialGroupDto })
  @Get(':groupId')
  public async findOne(
    @CurrentAuth() { accountId }: AuthData,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() expand: ExpandQuery<ExpandableField>,
  ) {
    return this.service.findOne(accountId, { groupId }, { expand: expand.fields });
  }

  @ApiOperation({ summary: 'Sort tutorial groups', description: 'Sort tutorial groups' })
  @ApiBody({ type: SortOrderListDto, required: true, description: 'Data for sorting tutorial groups' })
  @ApiOkResponse()
  @Patch('sort')
  @UserAccess({ adminOnly: true })
  public async sort(@CurrentAuth() { accountId }: AuthData, @Body() dto: SortOrderListDto) {
    return this.service.sort(accountId, dto);
  }

  @ApiOperation({ summary: 'Update tutorial group', description: 'Update tutorial group' })
  @ApiParam({ name: 'groupId', type: Number, required: true, description: 'Tutorial group id', example: 1 })
  @ApiBody({ type: UpdateTutorialGroupDto, required: true, description: 'Data for updating tutorial group' })
  @ApiOkResponse({ description: 'Updated tutorial group', type: TutorialGroupDto })
  @Patch(':groupId')
  @UserAccess({ adminOnly: true })
  public async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: UpdateTutorialGroupDto,
  ) {
    return this.service.update(accountId, groupId, dto);
  }

  @ApiOperation({ summary: 'Delete tutorial group', description: 'Delete tutorial group' })
  @ApiParam({ name: 'groupId', type: Number, required: true, description: 'Tutorial group id', example: 1 })
  @ApiOkResponse()
  @Delete(':groupId')
  @UserAccess({ adminOnly: true })
  public async delete(@CurrentAuth() { accountId }: AuthData, @Param('groupId', ParseIntPipe) groupId: number) {
    return this.service.delete(accountId, groupId);
  }
}
