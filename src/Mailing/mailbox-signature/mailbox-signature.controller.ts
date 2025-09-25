import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import {
  CreateMailboxSignatureDto,
  MailboxSignatureDto,
  MailboxSignatureFilterDto,
  UpdateMailboxSignatureDto,
} from './dto';
import { MailboxSignatureService } from './mailbox-signature.service';

@ApiTags('mailing/signature')
@Controller('mailing/signatures')
@JwtAuthorized()
@TransformToDto()
export class MailboxSignatureController {
  constructor(private readonly service: MailboxSignatureService) {}

  @ApiOperation({ summary: 'Create signature for mail', description: 'Create signature for mail' })
  @ApiBody({ type: CreateMailboxSignatureDto, required: true, description: 'Signature data' })
  @ApiCreatedResponse({ description: 'Signature', type: MailboxSignatureDto })
  @Post()
  async create(@CurrentAuth() { accountId, userId }: AuthData, @Body() dto: CreateMailboxSignatureDto) {
    return this.service.create({ accountId, userId, dto });
  }

  @ApiOperation({ summary: 'Get signatures for mail', description: 'Get signatures for accessible mailboxes' })
  @ApiQuery({ name: 'mailboxId', type: Number, required: false, description: 'Mailbox ID' })
  @ApiOkResponse({ description: 'Signatures', type: [MailboxSignatureDto] })
  @Get()
  async findMany(@CurrentAuth() { accountId, userId }: AuthData, @Query() filter: MailboxSignatureFilterDto) {
    return this.service.findMany({
      accountId,
      accessibleUserId: userId,
      mailboxId: filter?.mailboxId,
    });
  }

  @ApiOperation({ summary: 'Get signature', description: 'Get signature' })
  @ApiParam({ name: 'signatureId', type: Number, required: true, description: 'Signature ID' })
  @ApiOkResponse({ description: 'Signature', type: MailboxSignatureDto })
  @Get(':signatureId')
  async findOne(@CurrentAuth() { accountId }: AuthData, @Param('signatureId', ParseIntPipe) signatureId: number) {
    return this.service.findOne({ accountId, signatureId });
  }

  @ApiOperation({ summary: 'Update signature for mail', description: 'Update signature for mail' })
  @ApiParam({ name: 'signatureId', type: Number, required: true, description: 'Signature ID' })
  @ApiBody({ type: UpdateMailboxSignatureDto, required: true, description: 'Signature data' })
  @ApiOkResponse({ description: 'Signature', type: MailboxSignatureDto })
  @Put(':signatureId')
  async updatePut(
    @CurrentAuth() { accountId }: AuthData,
    @Param('signatureId', ParseIntPipe) signatureId: number,
    @Body() dto: UpdateMailboxSignatureDto,
  ) {
    return this.service.update({ accountId, signatureId, dto });
  }

  @ApiOperation({ summary: 'Update signature for mail', description: 'Update signature for mail' })
  @ApiParam({ name: 'signatureId', type: Number, required: true, description: 'Signature ID' })
  @ApiBody({ type: UpdateMailboxSignatureDto, required: true, description: 'Signature data' })
  @ApiOkResponse({ description: 'Signature', type: MailboxSignatureDto })
  @Patch(':signatureId')
  async updatePatch(
    @CurrentAuth() { accountId }: AuthData,
    @Param('signatureId', ParseIntPipe) signatureId: number,
    @Body() dto: UpdateMailboxSignatureDto,
  ) {
    return this.service.update({ accountId, signatureId, dto });
  }

  @ApiOperation({ summary: 'Delete signature for mail', description: 'Delete signature for mail' })
  @ApiParam({ name: 'signatureId', type: Number, required: true, description: 'Signature ID' })
  @ApiOkResponse()
  @Delete(':signatureId')
  async delete(@CurrentAuth() { accountId }: AuthData, @Param('signatureId', ParseIntPipe) signatureId: number) {
    return this.service.delete({ accountId, signatureId });
  }
}
