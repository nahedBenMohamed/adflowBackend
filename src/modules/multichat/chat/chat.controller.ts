import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CursorPagingQuery, PagingQuery, TransformToDto } from '@/common';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { AuthData } from '@/modules/iam/common/types/auth-data';
import { EntityInfoDto } from '@/modules/entity/entity-info';

import { ChatMessageStatus } from '../common';
import {
  ChatDto,
  CreatePersonalChatDto,
  CreateGroupChatDto,
  CreateExternalChatDto,
  FindChatsFullResultDto,
  ChatFindFilterDto,
  ChatFindPersonalFilterDto,
  ChatFindByMessageContentFilterDto,
  UpdateGroupChatDto,
  CreateContactLeadDto,
} from './dto';
import { ChatService } from './services';

@ApiTags('multichat/chats')
@Controller('chat/chats')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @ApiOperation({ summary: 'Create personal chat', description: 'Create personal chat' })
  @ApiBody({ description: 'Data for creating personal chat', type: CreatePersonalChatDto })
  @ApiCreatedResponse({ description: 'Chat', type: ChatDto })
  @Post('personal')
  async createPersonal(@CurrentAuth() { accountId, user }: AuthData, @Body() dto: CreatePersonalChatDto) {
    return this.service.createPersonalChat(accountId, user, dto);
  }

  @ApiOperation({ summary: 'Create group chat', description: 'Create group chat' })
  @ApiBody({ description: 'Data for creating group chat', type: CreateGroupChatDto })
  @ApiCreatedResponse({ description: 'Chat', type: ChatDto })
  @Post('group')
  async createGroup(@CurrentAuth() { accountId, user }: AuthData, @Body() dto: CreateGroupChatDto) {
    return this.service.createGroupChat(accountId, user, dto);
  }

  @ApiOperation({ summary: 'Create external chat', description: 'Create external chat' })
  @ApiBody({ description: 'Data for creating external chat', type: CreateExternalChatDto })
  @ApiCreatedResponse({ description: 'Chat', type: ChatDto })
  @Post('external')
  async createExternal(@CurrentAuth() { accountId, userId }: AuthData, @Body() dto: CreateExternalChatDto) {
    return this.service.createExternalChat(accountId, userId, dto);
  }

  @ApiOperation({ summary: 'Check exists', description: 'Check group chat exists for entity' })
  @ApiParam({ name: 'entityId', description: 'Checked Entity ID' })
  @ApiOkResponse({ description: 'Chat exists', type: Boolean })
  @Get('group/exists/:entityId')
  async checkByEntityId(@CurrentAuth() { accountId }: AuthData, @Param('entityId', ParseIntPipe) entityId: number) {
    return (await this.service.count(accountId, { entityId })) > 0;
  }

  @ApiOperation({
    summary: 'Get current user chats',
    description: 'Get current user chat with pagination and provider filter',
  })
  @ApiQuery({ name: 'providerId', description: 'Provider ID', required: false })
  @ApiOkResponse({ description: 'Chat list', type: [ChatDto] })
  @Get()
  async getChatsByCursor(
    @CurrentAuth() { accountId, user }: AuthData,
    @Query() paging: CursorPagingQuery,
    @Query('providerId') providerId: number | null,
  ) {
    return this.service.getChatsByCursor(accountId, user, providerId, paging);
  }

  @ApiOperation({
    summary: 'Search chats (simple)',
    description: 'Search chats with filter. Chats returned without additional data.',
  })
  @ApiOkResponse({ description: 'Search chat result', type: FindChatsFullResultDto })
  @Get('find')
  async findMany(
    @CurrentAuth() { accountId, userId }: AuthData,
    @Query() filter: ChatFindFilterDto,
    @Query() paging: PagingQuery,
  ) {
    return this.service.findMany({ accountId, filter, paging, accessUserId: userId });
  }

  @ApiOperation({
    summary: 'Search chats by user full name',
    description: 'Search chats by user full name. Chats returned with users, last message, entity info, etc.',
  })
  @ApiOkResponse({ description: 'Search chat result', type: FindChatsFullResultDto })
  @Get('find/full/personal')
  async findManyFullPersonal(
    @CurrentAuth() { accountId, user }: AuthData,
    @Query() filter: ChatFindPersonalFilterDto,
    @Query() paging: PagingQuery,
  ) {
    return this.service.findManyFullPersonal(accountId, user, filter, paging);
  }

  @ApiOperation({
    summary: 'Search chats by message content',
    description: 'Search chats by message content. Chats returned with users, last message, entity info, etc.',
  })
  @ApiOkResponse({ description: 'Search chat result', type: FindChatsFullResultDto })
  @Get('find/full/by-message-content')
  async findManyFullByMessageContent(
    @CurrentAuth() { accountId, user }: AuthData,
    @Query() paging: PagingQuery,
    @Query() filter: ChatFindByMessageContentFilterDto,
  ) {
    return this.service.findManyFullByMessageContent(accountId, user, filter, paging);
  }

  @ApiOperation({
    summary: 'Search chats (full)',
    description: 'Search chats with filter. Chats returned with users, last message, entity info, etc.',
  })
  @ApiOkResponse({ description: 'Search chat result', type: FindChatsFullResultDto })
  @Get('find/full')
  async findManyFull(
    @CurrentAuth() { accountId, user }: AuthData,
    @Query() filter: ChatFindFilterDto,
    @Query() paging: PagingQuery,
  ) {
    return this.service.findManyFull(accountId, user, filter, paging);
  }

  @ApiOperation({ summary: 'Get chat', description: 'Get chat by ID' })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiOkResponse({ description: 'Chat', type: ChatDto })
  @Get(':chatId')
  async getChatFull(@CurrentAuth() { accountId, user }: AuthData, @Param('chatId', ParseIntPipe) chatId: number) {
    return this.service.getChatFull(accountId, user, chatId);
  }

  @ApiOperation({ summary: 'Update group chat', description: 'Update group chat' })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiBody({ description: 'Data for updating group chat', type: UpdateGroupChatDto })
  @ApiOkResponse({ description: 'Chat', type: ChatDto })
  @Patch('group/:chatId')
  async updateGroup(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() dto: UpdateGroupChatDto,
  ) {
    return this.service.updateGroupChat(accountId, user, chatId, dto);
  }

  @ApiOperation({ summary: 'Delete chat', description: 'Delete chat by ID' })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiOkResponse({ description: 'Deleted chat ID', type: Number })
  @Delete(':chatId')
  async delete(@CurrentAuth() { accountId, userId }: AuthData, @Param('chatId', ParseIntPipe) chatId: number) {
    return this.service.delete(accountId, userId, chatId);
  }

  @ApiOperation({ summary: 'Pin chat message', description: 'Pin chat message' })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiOkResponse({ description: 'Chat', type: ChatDto })
  @Put(':chatId/pin/:messageId')
  async pinChatMessage(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    return this.service.pinMessage(accountId, user, chatId, messageId);
  }

  @ApiOperation({ summary: 'Unpin chat message', description: 'Unpin chat message' })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiOkResponse({ description: 'Chat', type: ChatDto })
  @Put(':chatId/unpin/:messageId')
  async unpinChatMessage(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    return this.service.unpinMessage(accountId, user, chatId, messageId);
  }

  @ApiOperation({ summary: 'Update chat messages status', description: 'Update chat messages status' })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiParam({ name: 'status', description: 'Message status' })
  @ApiOkResponse()
  @Put(':chatId/status/:status')
  async updateMessagesStatus(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('status', new ParseEnumPipe(ChatMessageStatus)) status: ChatMessageStatus,
  ) {
    await this.service.updateMessagesStatus({ accountId, user, chatId, status });
  }

  @ApiOperation({ summary: 'Create contact and lead', description: 'Create contact and lead for external chat' })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiBody({ description: 'Data for creating contact and lead', type: CreateContactLeadDto })
  @ApiCreatedResponse({ description: 'Created entity info', type: EntityInfoDto })
  @Post(':chatId/contact')
  async createLinkedEntities(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() dto: CreateContactLeadDto,
  ) {
    return this.service.createLinkedEntities({ accountId, user, chatId, dto });
  }
}
