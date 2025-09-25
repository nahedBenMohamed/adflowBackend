import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { PagingQuery, TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { CreateChatMessageScheduledDto, ChatMessageScheduledDto, ChatMessageScheduledFilterDto } from './dto';
import { ChatMessageScheduledService } from './chat-message-scheduled.service';

@ApiTags('multichat/messages/scheduled')
@Controller('/chat/messages/scheduled')
@JwtAuthorized({ access: { adminOnly: true } })
@TransformToDto()
export class ChatMessageScheduledController {
  constructor(private readonly service: ChatMessageScheduledService) {}

  @ApiOperation({ summary: 'Create scheduled message', description: 'Create scheduled message' })
  @ApiBody({ description: 'Data for creating scheduled message', type: CreateChatMessageScheduledDto })
  @ApiCreatedResponse({ description: 'Scheduled message', type: ChatMessageScheduledDto })
  @Post()
  public async create(@CurrentAuth() { accountId }: AuthData, @Body() dto: CreateChatMessageScheduledDto) {
    return this.service.create({ accountId, dto });
  }

  @ApiOperation({ summary: 'Get scheduled messages', description: 'Get scheduled messages' })
  @ApiOkResponse({ description: 'Scheduled messages', type: [ChatMessageScheduledDto] })
  @Get()
  public async findMany(@CurrentAuth() { accountId }: AuthData, @Query() paging: PagingQuery) {
    return this.service.findMany({ filter: { accountId }, paging });
  }

  @ApiOperation({ summary: 'Get scheduled message', description: 'Get scheduled message' })
  @ApiParam({ name: 'messageId', description: 'Scheduled message ID' })
  @ApiOkResponse({ description: 'Scheduled message', type: ChatMessageScheduledDto })
  @Get(':messageId')
  public async findOne(@CurrentAuth() { accountId }: AuthData, @Param('messageId', ParseIntPipe) messageId: number) {
    return this.service.findOne({ accountId, messageId });
  }

  @ApiOperation({ summary: 'Search scheduled messages', description: 'Search scheduled messages' })
  @ApiBody({ description: 'Data for searching scheduled messages', type: ChatMessageScheduledFilterDto })
  @ApiOkResponse({ description: 'Scheduled messages', type: [ChatMessageScheduledDto] })
  @Post('search')
  public async search(
    @CurrentAuth() { accountId }: AuthData,
    @Body() filter: ChatMessageScheduledFilterDto,
    @Query() paging: PagingQuery,
  ) {
    return this.service.findMany({ filter: { accountId, ...filter }, paging });
  }

  @ApiOperation({ summary: 'Delete scheduled message', description: 'Delete scheduled message' })
  @ApiParam({ name: 'messageId', description: 'Scheduled message ID' })
  @ApiOkResponse()
  @Delete(':messageId')
  public async delete(@CurrentAuth() { accountId }: AuthData, @Param('messageId', ParseIntPipe) messageId: number) {
    return this.service.delete({ accountId, messageId });
  }

  @ApiOperation({ summary: 'Delete scheduled messages', description: 'Delete scheduled messages' })
  @ApiBody({ description: 'Data for deleting scheduled messages', type: ChatMessageScheduledFilterDto })
  @ApiOkResponse()
  @Post('delete')
  public async deleteMany(@CurrentAuth() { accountId }: AuthData, @Body() filter: ChatMessageScheduledFilterDto) {
    return this.service.delete({ accountId, ...filter });
  }
}
