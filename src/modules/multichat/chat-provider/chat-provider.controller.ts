import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { ChatProviderDto } from './dto';
import { ChatProviderService } from './services';

@ApiTags('multichat/providers')
@Controller('chat/providers')
@JwtAuthorized()
@TransformToDto()
export class ChatProviderController {
  constructor(private readonly service: ChatProviderService) {}

  @ApiOperation({ summary: 'Get available providers', description: 'Get available providers for current user' })
  @ApiOkResponse({ description: 'Chat providers', type: [ChatProviderDto] })
  @Get()
  async findMany(@CurrentAuth() { accountId, userId }: AuthData): Promise<ChatProviderDto[]> {
    return this.service.findMany(accountId, userId, {}, { expand: ['unseenCount'] });
  }
}
