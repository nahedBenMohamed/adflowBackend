import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto, PagingQuery } from '@/common';
import { AuthData, AuthDataPrefetch, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { VoximplantCallDto, CreateVoximplantCallDto, VoximplantCallListDto, UpdateVoximplantCallDto } from './dto';
import { VoximplantCallService } from './voximplant-call.service';

@ApiTags('telephony/voximplant/calls')
@Controller('calls')
@JwtAuthorized()
@TransformToDto()
export class VoximplantCallController {
  constructor(private readonly service: VoximplantCallService) {}

  @ApiCreatedResponse({ description: 'Create voximplant call', type: VoximplantCallDto })
  @Post()
  async create(@CurrentAuth() { accountId, userId }: AuthData, @Body() dto: CreateVoximplantCallDto) {
    return this.service.create(accountId, userId, dto);
  }

  @AuthDataPrefetch({ user: true })
  @ApiCreatedResponse({ description: 'Get voximplant calls', type: VoximplantCallListDto })
  @Get()
  async getList(@CurrentAuth() { accountId, user }: AuthData, @Query() paging: PagingQuery) {
    return this.service.getList(accountId, user, paging);
  }
  @ApiCreatedResponse({ description: 'Get voximplant calls', type: VoximplantCallDto })
  @Get(':callId')
  async getOne(@CurrentAuth() { accountId }: AuthData, @Param('callId', ParseIntPipe) callId: number) {
    return this.service.findOne(accountId, { id: callId });
  }

  @ApiCreatedResponse({ description: 'Update voximplant call', type: VoximplantCallDto })
  @Patch(':externalId')
  async updateByExternalId(
    @CurrentAuth() { accountId, userId }: AuthData,
    @Param('externalId') externalId: string,
    @Body() dto: UpdateVoximplantCallDto,
  ) {
    return this.service.updateByExternalId(accountId, userId, externalId, dto);
  }
}
