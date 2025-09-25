import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { MailboxManualService } from '../../Service/MailboxManual/MailboxManualService';
import { MailboxSettingsManualDto } from '../../Service/MailboxManual/Dto/MailboxSettingsManualDto';

@ApiTags('mailing/settings/mailbox')
@Controller()
@JwtAuthorized()
export class GetMailboxSettingsManualController {
  constructor(private mailboxManualService: MailboxManualService) {}

  @ApiOkResponse({ description: 'Mailbox manual settings', type: MailboxSettingsManualDto })
  @Get('/mailing/settings/mailboxes/:id/manual')
  public async getMailboxSettings(
    @CurrentAuth() { accountId }: AuthData,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MailboxSettingsManualDto> {
    return await this.mailboxManualService.getManualSettings(accountId, id);
  }
}
