import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { MailMessageService } from '../../Service/MailMessage/MailMessageService';
import { MailMessageDto } from '../../Service/MailMessage/Dto/MailMessageDto';

@ApiTags('mailing/messages')
@Controller()
@JwtAuthorized({ prefetch: { user: true } })
export class GetMailThreadController {
  constructor(private mailMessageService: MailMessageService) {}

  @Get('/mailing/mailboxes/:mailboxId/threads/:messageId')
  @ApiOkResponse({ description: 'Mail thread', type: [MailMessageDto] })
  async getThread(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('mailboxId', ParseIntPipe) mailboxId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ): Promise<MailMessageDto[]> {
    return await this.mailMessageService.getThreadWithPayload(accountId, user, mailboxId, messageId);
  }
}
