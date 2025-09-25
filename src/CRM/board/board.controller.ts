import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { BoardDto, BoardFilterDto, CreateBoardDto, UpdateBoardDto } from './dto';
import { BoardService } from './board.service';

@ApiTags('crm/boards')
@Controller('crm/boards')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class BoardController {
  constructor(private readonly service: BoardService) {}

  @ApiOperation({ summary: 'Create board', description: 'Create board' })
  @ApiBody({ type: CreateBoardDto, required: true, description: 'Data for creating board' })
  @ApiCreatedResponse({ type: BoardDto, description: 'Created board' })
  @Post()
  public async create(@CurrentAuth() { accountId, user }: AuthData, @Body() dto: CreateBoardDto) {
    return await this.service.create({ accountId, user, dto });
  }

  @ApiOperation({ summary: 'Get boards', description: 'Get boards' })
  @ApiOkResponse({ description: 'Boards', type: [BoardDto] })
  @Get()
  public async findMany(@CurrentAuth() { accountId, user }: AuthData, @Query() filter: BoardFilterDto) {
    return await this.service.findMany({ user, filter: { accountId, ...filter } });
  }

  @ApiOperation({ summary: 'Get board', description: 'Get board' })
  @ApiParam({ name: 'boardId', description: 'Board ID', type: Number, required: true })
  @ApiOkResponse({ description: 'Board', type: BoardDto })
  @Get(':boardId')
  public async findOne(@CurrentAuth() { accountId, user }: AuthData, @Param('boardId', ParseIntPipe) boardId: number) {
    return await this.service.findOne({ user, filter: { accountId, boardId } });
  }

  @ApiOperation({ summary: 'Update board', description: 'Update board' })
  @ApiParam({ name: 'boardId', description: 'Board ID', type: Number, required: true })
  @ApiBody({ type: UpdateBoardDto, required: true, description: 'Data for updating board' })
  @ApiOkResponse({ description: 'Updated board', type: BoardDto })
  @Patch(':boardId')
  public async update(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() dto: UpdateBoardDto,
  ) {
    return await this.service.update({ accountId, user, boardId, dto });
  }

  @ApiOperation({ summary: 'Delete board', description: 'Delete board' })
  @ApiParam({ name: 'boardId', description: 'Board ID', type: Number, required: true })
  @ApiOkResponse()
  @Delete(':boardId')
  public async delete(@CurrentAuth() { accountId, userId }: AuthData, @Param('boardId', ParseIntPipe) boardId: number) {
    await this.service.delete({ accountId, userId, boardId, preserveLast: true });
  }
}
