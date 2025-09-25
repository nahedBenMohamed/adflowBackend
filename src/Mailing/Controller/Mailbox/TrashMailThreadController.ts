import { Controller, Param, ParseIntPipe, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { MailboxService } from '../../Service/Mailbox/MailboxService';

@ApiTags('mailing/mailbox')
@Controller()
@JwtAuthorized()
export class TrashMailThreadController {
  constructor(private mailboxService: MailboxService) {}

  @Put('/mailing/mailboxes/:mailboxId/threads/:messageId/trash')
  public async trashMailThread(
    @CurrentAuth() { accountId, userId }: AuthData,
    @Param('mailboxId', ParseIntPipe) mailboxId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    return await this.mailboxService.trashThread(accountId, userId, mailboxId, messageId);
  }
}
