import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { MailboxService } from '../../Service/Mailbox/MailboxService';
import { MailboxesInfoDto } from '../../Service/Mailbox/Dto/mailboxes-info.dto';

@ApiTags('mailing/mailbox')
@Controller()
@JwtAuthorized()
export class GetMailboxesInfoController {
  constructor(private mailboxService: MailboxService) {}

  @ApiOkResponse({ description: 'Mailboxes', type: MailboxesInfoDto })
  @Get('mailing/mailboxes')
  public async getMailboxes(@CurrentAuth() { accountId, userId }: AuthData): Promise<MailboxesInfoDto> {
    return await this.mailboxService.getMailboxesForInfo(accountId, userId);
  }
}
