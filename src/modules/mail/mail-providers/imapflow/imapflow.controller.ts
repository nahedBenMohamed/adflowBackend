import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData, AuthDataPrefetch, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { DeleteMailboxQuery } from '@/Mailing/common';
import { CreateMailboxImapflowDto, MailboxImapflowDto, UpdateMailboxImapflowDto } from './dto';
import { ImapflowService } from './imapflow.service';

@ApiTags('mail/settings/imapflow')
@Controller('mail/settings/imapflow/mailboxes')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class ImapflowController {
  constructor(private readonly service: ImapflowService) {}

  @ApiOperation({ summary: 'Create mailbox', description: 'Create mailbox for imapflow provider' })
  @ApiBody({ type: CreateMailboxImapflowDto, required: true, description: 'Mailbox settings' })
  @ApiCreatedResponse({ description: 'Mailbox', type: MailboxImapflowDto })
  @Post()
  async create(@CurrentAuth() { accountId, userId }: AuthData, @Body() dto: CreateMailboxImapflowDto) {
    return this.service.create({ accountId, userId, dto });
  }

  @ApiOperation({ summary: 'Get mailbox', description: 'Get mailbox for imapflow provider' })
  @ApiParam({ name: 'mailboxId', type: Number, required: true, description: 'Mailbox ID' })
  @ApiOkResponse({ description: 'Mailbox', type: MailboxImapflowDto })
  @AuthDataPrefetch({ user: true })
  @Get(':mailboxId')
  async findMailbox(@CurrentAuth() { accountId, user }: AuthData, @Param('mailboxId', ParseIntPipe) mailboxId: number) {
    return this.service.findMailbox({ accountId, mailboxId, ownerId: user.isAdmin ? undefined : user.id });
  }

  @ApiOperation({ summary: 'Update mailbox', description: 'Update mailbox for imapflow provider' })
  @ApiParam({ name: 'mailboxId', type: Number, required: true, description: 'Mailbox ID' })
  @ApiOkResponse({ description: 'Mailbox', type: MailboxImapflowDto })
  @Patch(':mailboxId')
  async update(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('mailboxId', ParseIntPipe) mailboxId: number,
    @Body() dto: UpdateMailboxImapflowDto,
  ) {
    return this.service.update({ accountId, user, mailboxId, dto });
  }

  @Delete(':mailboxId')
  async delete(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('mailboxId', ParseIntPipe) mailboxId: number,
    @Query() query: DeleteMailboxQuery,
  ) {
    await this.service.delete({ accountId, user, mailboxId, softDelete: query?.save });
  }
}
