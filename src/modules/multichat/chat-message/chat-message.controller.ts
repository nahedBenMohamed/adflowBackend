import { Body, Controller, Delete, Get, Param, ParseEnumPipe, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto, PagingQuery } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { ChatMessageStatus } from '../common';
import { ChatMessageDto } from './dto/chat-message.dto';
import { ChatMessagesFilterDto } from './dto/chat-messages-filter.dto';
import { ChatMessagesResultDto } from './dto/chat-messages-result.dto';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { ChatMessageService } from './services/chat-message.service';

@ApiTags('multichat/messages')
@Controller('/chat/chats/:chatId/messages')
@JwtAuthorized({ prefetch: { account: true, user: true } })
@TransformToDto()
export class ChatMessageController {
  constructor(private readonly service: ChatMessageService) {}

  @ApiCreatedResponse({ description: 'Create chat message', type: ChatMessageDto })
  @Post()
  public async create(
    @CurrentAuth() { account, user }: AuthData,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() dto: SendChatMessageDto,
  ) {
    return await this.service.create(account, user, chatId, dto);
  }

  @ApiCreatedResponse({ description: 'Get chat messages', type: ChatMessagesResultDto })
  @Get()
  public async getMany(
    @CurrentAuth() { account, userId }: AuthData,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Query() filter: ChatMessagesFilterDto,
    @Query() paging: PagingQuery,
  ) {
    return await this.service.getMessagesForUI(account, userId, chatId, filter, paging);
  }

  @ApiCreatedResponse({ description: 'Get chat message', type: ChatMessageDto })
  @Get(':messageId')
  public async getOne(
    @CurrentAuth() { account, userId }: AuthData,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    return await this.service.getMessageDto(account, userId, chatId, messageId);
  }

  @ApiCreatedResponse({ description: 'Update chat message', type: ChatMessageDto })
  @Put(':messageId')
  public async update(
    @CurrentAuth() { account, user }: AuthData,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() dto: SendChatMessageDto,
  ) {
    return await this.service.update(account, user, chatId, messageId, dto);
  }

  @ApiOkResponse({ description: 'Chat message deleted', type: Boolean })
  @Delete(':messageId')
  public async delete(
    @CurrentAuth() { account, user }: AuthData,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ): Promise<boolean> {
    return await this.service.delete(account, user, chatId, messageId);
  }

  @ApiCreatedResponse({ description: 'Update chat messages status', type: [ChatMessageDto] })
  @Post('status/:status')
  public async updateMessagesStatus(
    @CurrentAuth() { account, user }: AuthData,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('status', new ParseEnumPipe(ChatMessageStatus)) status: ChatMessageStatus,
    @Body('messageIds') messageIds: number[],
  ) {
    return await this.service.updateStatusBatch(account, user, chatId, messageIds, status);
  }

  @ApiCreatedResponse({ description: 'Update chat message status', type: ChatMessageDto })
  @Put(':messageId/status/:status')
  public async updateMessageStatus(
    @CurrentAuth() { account, user }: AuthData,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Param('status', new ParseEnumPipe(ChatMessageStatus)) status: ChatMessageStatus,
  ) {
    return await this.service.updateStatus(account, user, chatId, messageId, status);
  }

  @ApiCreatedResponse({ description: 'React to chat message', type: ChatMessageDto })
  @Put(':messageId/react/:reaction')
  public async reactMessage(
    @CurrentAuth() { account, user }: AuthData,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Param('reaction') reaction: string,
  ) {
    return await this.service.react(account, user, chatId, messageId, reaction);
  }

  @ApiCreatedResponse({ description: 'Clear reaction to chat message', type: ChatMessageDto })
  @Put(':messageId/unreact/:reactionId')
  public async unreactMessage(
    @CurrentAuth() { account, user }: AuthData,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Param('reactionId', ParseIntPipe) reactionId: number,
  ) {
    return await this.service.unreact(account, user, chatId, messageId, reactionId);
  }
}
