import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { MailboxGmailService } from '../../Service/MailboxGmail/MailboxGmailService';

@ApiTags('mailing/settings/mailbox')
@Controller()
@JwtAuthorized()
export class GmailAuthConnectController {
  constructor(private readonly gmailService: MailboxGmailService) {}

  @Get('/mailing/settings/mailboxes/gmail/connect/:mailboxId')
  @ApiOkResponse({ description: 'Gmail connection url', type: String })
  async connect(
    @CurrentAuth() { accountId }: AuthData,
    @Param('mailboxId', ParseIntPipe) mailboxId: number,
  ): Promise<string> {
    return await this.gmailService.getAuthorizeUrl({ accountId, mailboxId });
  }
}
