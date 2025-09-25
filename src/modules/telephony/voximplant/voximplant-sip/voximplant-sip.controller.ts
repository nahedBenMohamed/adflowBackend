import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

import { ExpandQuery, TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized, UserAccess } from '@/modules/iam/common';

import { CreateVoximplantSIPDto, UpdateVoximplantSIPDto, VoximplantSIPDto, VoximplantSipFilterDto } from './dto';
import { ExpandableField } from './types';
import { VoximplantSipService } from './services';

@ApiTags('telephony/voximplant/sip')
@Controller('sip')
@JwtAuthorized()
@TransformToDto()
export class VoximplantSipController {
  constructor(private readonly service: VoximplantSipService) {}

  @ApiCreatedResponse({ description: 'Create voximplant SIP registration', type: VoximplantSIPDto })
  @Post()
  @UserAccess({ adminOnly: true })
  public async create(@CurrentAuth() { accountId }: AuthData, @Body() dto: CreateVoximplantSIPDto) {
    return this.service.create(accountId, dto);
  }

  @ApiOkResponse({ description: 'Get voximplant SIP registrations', type: [VoximplantSIPDto] })
  @ApiQuery({
    name: 'expand',
    type: String,
    required: false,
    isArray: true,
    description: 'Expand fields. Values: users,registration.',
  })
  @Get()
  public async getMany(
    @CurrentAuth() { accountId }: AuthData,
    @Query() filter: VoximplantSipFilterDto,
    @Query() expand?: ExpandQuery<ExpandableField>,
  ) {
    return this.service.findMany(accountId, filter, { expand: expand.fields });
  }

  @ApiOkResponse({ description: 'Get voximplant SIP registration by external Id', type: VoximplantSIPDto })
  @ApiQuery({
    name: 'expand',
    type: String,
    required: false,
    isArray: true,
    description: 'Expand fields. Values: users,registration.',
  })
  @Get('external/:externalId')
  public async getOneByExternalId(
    @CurrentAuth() { accountId }: AuthData,
    @Param('externalId', ParseIntPipe) externalId: number,
    @Query() expand?: ExpandQuery<ExpandableField>,
  ) {
    return this.service.findOne(accountId, { externalId }, { expand: expand.fields });
  }

  @ApiOkResponse({ description: 'Get voximplant SIP registration', type: VoximplantSIPDto })
  @ApiQuery({
    name: 'expand',
    type: String,
    required: false,
    isArray: true,
    description: 'Expand fields. Values: users,registration.',
  })
  @Get(':sipId')
  public async getOne(
    @CurrentAuth() { accountId }: AuthData,
    @Param('sipId', ParseIntPipe) sipId: number,
    @Query() expand?: ExpandQuery<ExpandableField>,
  ) {
    return this.service.findOne(accountId, { sipId }, { expand: expand.fields });
  }

  @ApiOkResponse({ description: 'Update voximplant SIP registration', type: VoximplantSIPDto })
  @Patch(':sipId')
  @UserAccess({ adminOnly: true })
  public async update(
    @CurrentAuth() { accountId }: AuthData,
    @Param('sipId', ParseIntPipe) sipId: number,
    @Body() dto: UpdateVoximplantSIPDto,
  ) {
    return this.service.update(accountId, sipId, dto);
  }

  @ApiOkResponse({ description: 'Delete voximplant SIP registration' })
  @Delete(':sipId')
  @UserAccess({ adminOnly: true })
  public async delete(@CurrentAuth() { accountId }: AuthData, @Param('sipId', ParseIntPipe) sipId: number) {
    return this.service.delete(accountId, sipId);
  }
}
