import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized, UserAccess } from '@/modules/iam/common';

import {
  BoardStageDto,
  CreateBoardStageDto,
  ProcessBoardStageDto,
  UpdateBoardStageDto,
  UpdateBoardStagesDto,
} from './dto';
import { BoardStageService } from './board-stage.service';

@ApiTags('crm/boards/stages')
@Controller('crm/boards/:boardId/stages')
@JwtAuthorized()
@TransformToDto()
export class BoardStageController {
  constructor(private readonly service: BoardStageService) {}

  @ApiOperation({ summary: 'Create board stage', description: 'Create board stage' })
  @ApiParam({ name: 'boardId', description: 'Board ID', type: Number, required: true })
  @ApiBody({ type: CreateBoardStageDto, description: 'Data for creating board stage', required: true })
  @ApiCreatedResponse({ description: 'Board stage', type: BoardStageDto })
  @Post()
  @UserAccess({ adminOnly: true })
  async create(
    @CurrentAuth() { accountId }: AuthData,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() dto: CreateBoardStageDto,
  ) {
    return this.service.create({ accountId, boardId, dto });
  }

  @ApiOperation({
    summary: 'Get board stages',
    description: `Get board stages. Use 'all' for boardId to get all stages for account.`,
  })
  @ApiParam({ name: 'boardId', description: `Board ID`, type: Number, required: true })
  @ApiOkResponse({ description: 'Board stages', type: [BoardStageDto] })
  @Get()
  async findMany(@CurrentAuth() { accountId }: AuthData, @Param('boardId', ParseIntPipe) boardId: number) {
    return this.service.findMany({ accountId, boardId });
  }

  @ApiOperation({ summary: 'Get board stage', description: 'Get board stage.' })
  @ApiParam({ name: 'boardId', description: 'Board ID', type: Number, required: true })
  @ApiParam({ name: 'stageId', description: 'Stage ID', type: Number, required: true })
  @ApiOkResponse({ description: 'Board stage', type: BoardStageDto })
  @Get(':stageId')
  async findOne(
    @CurrentAuth() { accountId }: AuthData,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('stageId', ParseIntPipe) stageId: number,
  ) {
    return this.service.findOne({ accountId, boardId, stageId });
  }

  @ApiOperation({ summary: 'Update board stages', description: 'Update board stages' })
  @ApiParam({ name: 'boardId', description: 'Board ID', type: Number, required: true })
  @ApiBody({ type: UpdateBoardStagesDto, description: 'Data for updating board stages', required: true })
  @ApiOkResponse({ description: 'Board stage', type: BoardStageDto })
  @Patch()
  @UserAccess({ adminOnly: true })
  async updateMany(
    @CurrentAuth() { accountId }: AuthData,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() dto: UpdateBoardStagesDto,
  ) {
    return this.service.updateMany({ accountId, boardId, dtos: dto.stages });
  }

  @ApiOperation({ summary: 'Update board stage', description: 'Update board stage.' })
  @ApiParam({ name: 'boardId', description: 'Board ID', type: Number, required: true })
  @ApiParam({ name: 'stageId', description: 'Stage ID', type: Number, required: true })
  @ApiBody({ type: UpdateBoardStageDto, description: 'Data for updating board stage', required: true })
  @ApiOkResponse({ description: 'Board stage', type: BoardStageDto })
  @Patch(':stageId')
  @UserAccess({ adminOnly: true })
  async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('stageId', ParseIntPipe) stageId: number,
    @Body() dto: UpdateBoardStageDto,
  ) {
    return this.service.update({ accountId, boardId, stageId, dto });
  }

  @ApiOperation({ summary: 'Process board stages', description: 'Process board stages. Create or update stages.' })
  @ApiParam({ name: 'boardId', description: 'Board ID', type: Number, required: true })
  @ApiBody({ type: ProcessBoardStageDto, description: 'Data for processing board stages', required: true })
  @ApiCreatedResponse({ description: 'Board stages', type: [BoardStageDto] })
  @Post('batch')
  @UserAccess({ adminOnly: true })
  async processBatch(
    @CurrentAuth() { accountId }: AuthData,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() dto: ProcessBoardStageDto,
  ) {
    return this.service.processBatch({ accountId, boardId, dtos: dto?.stages });
  }

  @ApiOperation({ summary: 'Delete board stage', description: 'Delete board stage and move related to new stage.' })
  @ApiParam({ name: 'boardId', description: 'Board ID', type: Number, required: true })
  @ApiParam({ name: 'stageId', description: 'Stage ID', type: Number, required: true })
  @ApiQuery({ name: 'newStageId', description: 'New stage ID', type: Number, required: true })
  @ApiOkResponse({ description: 'Deleted stage ID', type: Number })
  @Delete(':stageId')
  @UserAccess({ adminOnly: true })
  async delete(
    @CurrentAuth() { accountId }: AuthData,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('stageId', ParseIntPipe) stageId: number,
    @Query('newStageId', ParseIntPipe) newStageId: number,
  ) {
    return this.service.delete({ accountId, boardId, stageId, newStageId });
  }
}
