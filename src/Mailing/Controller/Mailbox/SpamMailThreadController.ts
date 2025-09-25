import { Controller, Param, ParseIntPipe, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { MailboxService } from '../../Service/Mailbox/MailboxService';

@ApiTags('mailing/mailbox')
@Controller()
@JwtAuthorized()
export class SpamMailThreadController {
  constructor(private mailboxService: MailboxService) {}

  @Put('/mailing/mailboxes/:mailboxId/threads/:messageId/spam')
  public async spamMailThread(
    @CurrentAuth() { accountId, userId }: AuthData,
    @Param('mailboxId', ParseIntPipe) mailboxId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    return await this.mailboxService.spamThread(accountId, userId, mailboxId, messageId);
  }
}
