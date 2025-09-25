import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData, AuthDataPrefetch, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { CreateMailboxDto, MailboxDto, UpdateMailboxDto } from './dto';
import { MailboxService } from './services';

@ApiTags('mailing/mailbox/settings')
@Controller('mailing/settings/mailboxes')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class MailboxController {
  constructor(private readonly service: MailboxService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Mailbox', type: MailboxDto })
  async create(@CurrentAuth() { accountId, userId }: AuthData, @Body() dto: CreateMailboxDto) {
    return this.service.create({ accountId, userId, dto });
  }

  @ApiOkResponse({ description: 'Mailboxes', type: [MailboxDto] })
  @AuthDataPrefetch({ user: true })
  @Get()
  async findMany(@CurrentAuth() { accountId, user }: AuthData) {
    return this.service.findMany({ accountId, ownerId: user.isAdmin ? undefined : user.id });
  }

  @ApiOkResponse({ description: 'Mailbox', type: MailboxDto })
  @AuthDataPrefetch({ user: true })
  @Get(':mailboxId')
  async findOne(@CurrentAuth() { accountId, user }: AuthData, @Param('mailboxId', ParseIntPipe) mailboxId: number) {
    return this.service.findOne({ accountId, mailboxId, ownerId: user.isAdmin ? undefined : user.id });
  }

  @ApiOkResponse({ description: 'Mailbox', type: MailboxDto })
  @Put(':mailboxId')
  async updatePut(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('mailboxId', ParseIntPipe) mailboxId: number,
    @Body() dto: UpdateMailboxDto,
  ) {
    return this.service.update({ accountId, user, mailboxId, dto });
  }

  @ApiOkResponse({ description: 'Mailbox', type: MailboxDto })
  @Patch(':mailboxId')
  async updatePatch(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('mailboxId', ParseIntPipe) mailboxId: number,
    @Body() dto: UpdateMailboxDto,
  ) {
    return this.service.update({ accountId, user, mailboxId, dto });
  }

  @Delete(':mailboxId')
  async delete(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('mailboxId', ParseIntPipe) mailboxId: number,
    @Query('save') save: string,
  ) {
    await this.service.delete({ accountId, user, mailboxId, softDelete: save === 'true' });
  }
}
