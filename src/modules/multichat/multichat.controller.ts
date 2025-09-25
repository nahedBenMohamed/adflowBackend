import { Controller, Get, Param, ParseEnumPipe, Put } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { AuthData, AuthDataPrefetch, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { ChatMessageStatus } from './common';
import { ChatService } from './chat/services/chat.service';

@ApiTags('multichat')
@Controller('chat')
@JwtAuthorized()
export class MultichatController {
  constructor(private readonly service: ChatService) {}

  @ApiOperation({ summary: 'Get unseen messages count', description: 'Get unseen messages count for current user' })
  @ApiOkResponse({ description: `Unseen messages count`, type: Number })
  @Get('unseen-count')
  async getUnseenCount(@CurrentAuth() { accountId, userId }: AuthData): Promise<number> {
    return await this.service.getUnseenForUser(accountId, userId);
  }

  @ApiOperation({ summary: 'Update all chats messages status', description: 'Update all chats messages status' })
  @ApiParam({ name: 'status', description: 'Message status' })
  @ApiOkResponse()
  @Put('status/:status')
  @AuthDataPrefetch({ user: true })
  async updateMessagesStatus(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('status', new ParseEnumPipe(ChatMessageStatus)) status: ChatMessageStatus,
  ) {
    await this.service.updateMessagesStatus({ accountId, user, status });
  }
}
