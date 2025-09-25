import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { MailboxManualService } from '../../Service/MailboxManual/MailboxManualService';
import { MailboxSettingsManualDto } from '../../Service/MailboxManual/Dto/MailboxSettingsManualDto';
import { UpdateMailboxSettingsManualDto } from '../../Service/MailboxManual/Dto/UpdateMailboxSettingsManualDto';

@ApiTags('mailing/settings/mailbox')
@Controller()
@JwtAuthorized()
export class UpdateMailboxSettingsManualController {
  constructor(private mailboxManualService: MailboxManualService) {}

  @Post('mailing/settings/mailboxes/:id/manual')
  @ApiCreatedResponse({ description: 'Mailbox', type: MailboxSettingsManualDto })
  public async updateMailboxSettings(
    @CurrentAuth() { accountId }: AuthData,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMailboxSettingsManualDto,
  ) {
    return await this.mailboxManualService.saveManualSettings(accountId, id, dto);
  }
}
