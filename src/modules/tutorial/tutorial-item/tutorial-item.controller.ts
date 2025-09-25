import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { SortOrderListDto, TransformToDto } from '@/common';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { UserAccess } from '@/modules/iam/common/decorators/user-access.decorator';
import { AuthData } from '@/modules/iam/common/types/auth-data';

import { TutorialItemDto, CreateTutorialItemDto, UpdateTutorialItemDto } from './dto';
import { TutorialItemService } from './tutorial-item.service';

@ApiTags('tutorial/items')
@Controller('groups/:groupId/items')
@JwtAuthorized()
@TransformToDto()
export class TutorialItemController {
  constructor(private readonly service: TutorialItemService) {}

  @ApiOperation({ summary: 'Create tutorial item', description: 'Create tutorial item' })
  @ApiParam({ name: 'groupId', type: Number, required: true, description: 'Tutorial group id' })
  @ApiBody({ type: CreateTutorialItemDto, required: true, description: 'Data for creating tutorial item' })
  @ApiCreatedResponse({ description: 'Created tutorial item', type: TutorialItemDto })
  @Post()
  @UserAccess({ adminOnly: true })
  public async create(
    @CurrentAuth() { accountId }: AuthData,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateTutorialItemDto,
  ) {
    return this.service.create(accountId, groupId, dto);
  }

  @ApiOperation({ summary: 'Get tutorial items', description: 'Get tutorial items' })
  @ApiParam({ name: 'groupId', type: Number, required: true, description: 'Tutorial group id' })
  @ApiOkResponse({ description: 'Tutorial items', type: [TutorialItemDto] })
  @Get()
  public async findMany(@CurrentAuth() { accountId }: AuthData, @Param('groupId', ParseIntPipe) groupId: number) {
    return this.service.findMany(accountId, { groupId });
  }

  @ApiOperation({ summary: 'Get tutorial item', description: 'Get tutorial item' })
  @ApiParam({ name: 'groupId', type: Number, required: true, description: 'Tutorial group id' })
  @ApiParam({ name: 'itemId', type: Number, required: true, description: 'Tutorial item id' })
  @ApiOkResponse({ description: 'Tutorial item', type: TutorialItemDto })
  @Get(':itemId')
  public async findOne(
    @CurrentAuth() { accountId }: AuthData,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.service.findOne(accountId, { groupId, itemId });
  }

  @ApiOperation({ summary: 'Sort tutorial items', description: 'Sort tutorial items' })
  @ApiParam({ name: 'groupId', type: Number, required: true, description: 'Tutorial group id' })
  @ApiBody({ type: SortOrderListDto, required: true, description: 'Data for sorting tutorial items' })
  @ApiOkResponse()
  @Patch('sort')
  @UserAccess({ adminOnly: true })
  public async sort(@CurrentAuth() { accountId }: AuthData, @Body() dto: SortOrderListDto) {
    return this.service.sort(accountId, dto);
  }

  @ApiOperation({ summary: 'Update tutorial item', description: 'Update tutorial item' })
  @ApiParam({ name: 'groupId', type: Number, required: true, description: 'Tutorial group id' })
  @ApiParam({ name: 'itemId', type: Number, required: true, description: 'Tutorial item id' })
  @ApiBody({ type: UpdateTutorialItemDto, required: true, description: 'Data for updating tutorial item' })
  @ApiOkResponse({ description: 'Updated tutorial item', type: TutorialItemDto })
  @Patch(':itemId')
  @UserAccess({ adminOnly: true })
  public async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateTutorialItemDto,
  ) {
    return this.service.update(accountId, groupId, itemId, dto);
  }

  @ApiOperation({ summary: 'Delete tutorial item', description: 'Delete tutorial item' })
  @ApiParam({ name: 'groupId', type: Number, required: true, description: 'Tutorial group id' })
  @ApiParam({ name: 'itemId', type: Number, required: true, description: 'Tutorial item id' })
  @ApiOkResponse()
  @Delete(':itemId')
  @UserAccess({ adminOnly: true })
  public async delete(
    @CurrentAuth() { accountId }: AuthData,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.service.delete(accountId, groupId, itemId);
  }
}
