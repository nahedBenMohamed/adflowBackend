import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { EntityInfoDto } from '@/modules/entity/entity-info';

import { MailMessageService } from '../../Service/MailMessage/MailMessageService';
import { CreateContactLeadDto } from '../../Service/MailMessage/Dto/CreateContactLeadDto';

@ApiTags('mailing/messages')
@Controller()
@JwtAuthorized({ prefetch: { user: true } })
export class CreateContactAndLeadController {
  constructor(private mailMessageService: MailMessageService) {}

  @Post('/mailing/mailboxes/:mailboxId/messages/:messageId/contact')
  @ApiOkResponse({ description: 'Created contact and lead', type: EntityInfoDto })
  async createContactAndLead(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('mailboxId', ParseIntPipe) mailboxId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() dto: CreateContactLeadDto,
  ): Promise<EntityInfoDto> {
    return await this.mailMessageService.createContact(accountId, user, mailboxId, messageId, dto);
  }
}
