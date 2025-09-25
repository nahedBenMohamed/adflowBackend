import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { MailMessageService } from '../../Service/MailMessage/MailMessageService';
import { MailThreadResult } from '../../Service/MailMessage/MailThreadResult';
import { GetMailboxMessagesFilter } from './GetMailboxMessagesFilter';

@ApiTags('mailing/messages')
@Controller()
@JwtAuthorized({ prefetch: { user: true } })
export class GetMailboxMessagesController {
  constructor(private mailMessageService: MailMessageService) {}

  @Get('/mailing/mailboxes/:mailboxId/messages')
  @ApiOkResponse({ description: 'Mail thread list', type: MailThreadResult })
  async getMessages(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('mailboxId', ParseIntPipe) mailboxId: number,
    @Query() filter: GetMailboxMessagesFilter,
  ): Promise<MailThreadResult> {
    return await this.mailMessageService.getMessagesForMailbox(accountId, user, mailboxId, filter);
  }
}
