import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { MailboxFolderType } from '../../common';
import { MailMessageService } from '../../Service/MailMessage/MailMessageService';
import { MailThreadResult } from '../../Service/MailMessage/MailThreadResult';
import { GetSectionMessagesFilter } from './GetSectionMessagesFilter';

@ApiTags('mailing/messages')
@Controller()
@JwtAuthorized({ prefetch: { user: true } })
export class GetSectionMessagesController {
  constructor(private mailMessageService: MailMessageService) {}

  @Get('/mailing/section/:type/messages')
  @ApiOkResponse({ description: 'Mail list', type: MailThreadResult })
  async getMessages(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('type') type: MailboxFolderType,
    @Query() filter: GetSectionMessagesFilter,
  ): Promise<MailThreadResult> {
    return await this.mailMessageService.getMessagesForSection(accountId, user, type, filter);
  }
}
