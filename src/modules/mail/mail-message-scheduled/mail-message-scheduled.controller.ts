import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { PagingQuery, TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { CreateMailMessageScheduledDto, MailMessageScheduledDto, MailMessageScheduledFilterDto } from './dto';
import { MailMessageScheduledService } from './mail-message-scheduled.service';

@ApiTags('mail/scheduled')
@Controller('mail/scheduled')
@JwtAuthorized({ access: { adminOnly: true } })
@TransformToDto()
export class MailMessageScheduledController {
  constructor(private readonly service: MailMessageScheduledService) {}

  @ApiOperation({ summary: 'Create scheduled message', description: 'Create scheduled message' })
  @ApiBody({ description: 'Data for creating scheduled message', type: CreateMailMessageScheduledDto })
  @ApiCreatedResponse({ description: 'Scheduled message', type: MailMessageScheduledDto })
  @Post()
  async create(@CurrentAuth() { accountId }: AuthData, @Body() dto: CreateMailMessageScheduledDto) {
    return this.service.create({ accountId, dto });
  }

  @ApiOperation({ summary: 'Get scheduled messages', description: 'Get scheduled messages' })
  @ApiOkResponse({ description: 'Scheduled messages', type: [MailMessageScheduledDto] })
  @Get()
  async findMany(@CurrentAuth() { accountId }: AuthData, @Query() paging: PagingQuery) {
    return this.service.findMany({ filter: { accountId }, paging });
  }

  @ApiOperation({ summary: 'Get scheduled message', description: 'Get scheduled message' })
  @ApiParam({ name: 'messageId', description: 'Scheduled message ID' })
  @ApiOkResponse({ description: 'Scheduled message', type: MailMessageScheduledDto })
  @Get(':messageId')
  async findOne(@CurrentAuth() { accountId }: AuthData, @Param('messageId', ParseIntPipe) messageId: number) {
    return this.service.findOne({ accountId, messageId });
  }

  @ApiOperation({ summary: 'Search scheduled messages', description: 'Search scheduled messages' })
  @ApiBody({ description: 'Data for searching scheduled messages', type: MailMessageScheduledFilterDto })
  @ApiOkResponse({ description: 'Scheduled messages', type: [MailMessageScheduledDto] })
  @Post('search')
  async search(
    @CurrentAuth() { accountId }: AuthData,
    @Body() filter: MailMessageScheduledFilterDto,
    @Query() paging: PagingQuery,
  ) {
    return this.service.findMany({ filter: { accountId, ...filter }, paging });
  }

  @ApiOperation({ summary: 'Delete scheduled message', description: 'Delete scheduled message' })
  @ApiParam({ name: 'messageId', description: 'Scheduled message ID' })
  @ApiOkResponse()
  @Delete(':messageId')
  async delete(@CurrentAuth() { accountId }: AuthData, @Param('messageId', ParseIntPipe) messageId: number) {
    return this.service.delete({ accountId, messageId });
  }

  @ApiOperation({ summary: 'Delete scheduled messages', description: 'Delete scheduled messages' })
  @ApiBody({ description: 'Data for deleting scheduled messages', type: MailMessageScheduledFilterDto })
  @ApiOkResponse()
  @Post('delete')
  async deleteMany(@CurrentAuth() { accountId }: AuthData, @Body() filter: MailMessageScheduledFilterDto) {
    return this.service.delete({ accountId, ...filter });
  }
}
