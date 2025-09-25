import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { MailboxGmailService } from '../../Service/MailboxGmail/MailboxGmailService';

@ApiExcludeController(true)
@Controller()
export class GmailAuthCallbackController {
  constructor(private gmailService: MailboxGmailService) {}

  @Redirect()
  @Get('/mailing/settings/mailboxes/gmail/callback')
  public async callback(@Query('code') code: string, @Query('state') state: string) {
    const redirectUrl = await this.gmailService.processAuthCode({ code, state });

    return { url: redirectUrl, statusCode: 302 };
  }
}
