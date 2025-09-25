import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData, AuthDataPrefetch, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { CalendarAccessDto, CreateGoogleCalendarDto, GoogleCalendarDto, UpdateGoogleCalendarDto } from './dto';
import { CalendarService } from './calendar.service';

@ApiTags('integration/google/calendar')
@Controller('integration/google/calendar')
@JwtAuthorized()
@TransformToDto()
export class CalendarController {
  constructor(private readonly service: CalendarService) {}

  @ApiOperation({
    summary: 'Generate authorization URL',
    description: 'Generate Google authorization URL for Calendar integration',
  })
  @ApiOkResponse({ type: String, description: 'Google authorization URL' })
  @Get('authorize-url')
  public async getAuthorizeUrl(@CurrentAuth() { accountId, userId }: AuthData): Promise<string> {
    return this.service.getAuthorizeUrl({ accountId, userId });
  }

  @ApiOperation({
    summary: 'Process authorization code',
    description: 'Process Google authorization code for Calendar integration and get accessible calendars',
  })
  @ApiQuery({ name: 'code', type: String, required: true, description: 'Google authorization code' })
  @ApiQuery({ name: 'state', type: String, required: false, description: 'State' })
  @ApiOkResponse({ type: CalendarAccessDto, description: 'Accessible calendars and access token' })
  @Get('process-code')
  public async processAuthCode(@Query('code') code: string, @Query('state') state?: string) {
    return this.service.processAuthCode({ code, state });
  }

  @ApiOperation({
    summary: 'Create Google calendar integration',
    description: 'Create Google calendar integration',
  })
  @ApiBody({
    type: CreateGoogleCalendarDto,
    required: true,
    description: 'Data for creating Google calendar integration',
  })
  @ApiOkResponse({ type: GoogleCalendarDto, description: 'Google calendar integration' })
  @Post()
  public async create(@CurrentAuth() { accountId, userId }: AuthData, @Body() dto: CreateGoogleCalendarDto) {
    return this.service.create({ accountId, userId, dto });
  }

  @ApiOperation({ summary: 'Find Google calendars integrations', description: 'Find Google calendars integrations' })
  @ApiOkResponse({ type: [GoogleCalendarDto], description: 'Google calendars integrations' })
  @Get()
  @AuthDataPrefetch({ user: true })
  public async findMany(@CurrentAuth() { accountId, user }: AuthData) {
    return this.service.findMany({ accountId, user });
  }

  @ApiOperation({ summary: 'Find Google calendar integration', description: 'Find Google calendar integration' })
  @ApiParam({ name: 'calendarId', type: Number, required: true, description: 'Google calendar ID' })
  @ApiOkResponse({ type: GoogleCalendarDto, description: 'Google calendar integration' })
  @Get(':calendarId')
  @AuthDataPrefetch({ user: true })
  public async findOne(@CurrentAuth() { accountId, user }: AuthData, @Param('calendarId') calendarId: number) {
    return this.service.findOne({ accountId, user, calendarId });
  }

  @ApiOperation({
    summary: 'Update Google calendar integration',
    description: 'Update Google calendar integration',
  })
  @ApiParam({ name: 'calendarId', type: Number, required: true, description: 'Google calendar ID' })
  @ApiBody({
    type: UpdateGoogleCalendarDto,
    required: true,
    description: 'Data for updating Google calendar integration',
  })
  @ApiOkResponse({ type: GoogleCalendarDto, description: 'Google calendar integration' })
  @Patch(':calendarId')
  public async update(
    @CurrentAuth() { accountId, userId }: AuthData,
    @Param('calendarId') calendarId: number,
    @Body() dto: UpdateGoogleCalendarDto,
  ) {
    return this.service.update({ accountId, userId, calendarId, dto });
  }

  @ApiOperation({
    summary: 'Delete Google calendar integration',
    description: 'Delete Google calendar integration',
  })
  @ApiParam({ name: 'calendarId', type: Number, required: true, description: 'Google calendar ID' })
  @ApiOkResponse({ type: Number, description: 'Deleted Google calendar ID' })
  @Delete(':calendarId')
  public async delete(@CurrentAuth() { accountId }: AuthData, @Param('calendarId') calendarId: number) {
    return this.service.delete({ accountId, calendarId });
  }
}
