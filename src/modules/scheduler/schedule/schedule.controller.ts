import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { AuthData, AuthDataPrefetch, CurrentAuth, JwtAuthorized, UserAccess } from '@/modules/iam/common';

import { ScheduleDto, CreateScheduleDto, ScheduleFilterDto, UpdateScheduleDto } from './dto';
import { ScheduleService } from './services';

@ApiTags('scheduler/schedule')
@Controller('schedules')
@JwtAuthorized()
@TransformToDto()
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  @ApiOperation({ summary: 'Create schedule', description: 'Create schedule with performers' })
  @ApiBody({ description: 'Data for creating schedule', type: CreateScheduleDto })
  @ApiCreatedResponse({ description: 'Schedule', type: ScheduleDto })
  @UserAccess({ adminOnly: true })
  @Post()
  async create(@CurrentAuth() { accountId, userId }: AuthData, @Body() dto: CreateScheduleDto) {
    return this.service.create({ accountId, userId, dto });
  }

  @ApiOperation({ summary: 'Get list of schedules', description: 'Get list of schedules with performers' })
  @ApiOkResponse({ description: 'List of schedules', type: [ScheduleDto] })
  @AuthDataPrefetch({ user: true })
  @Get()
  async getMany(@CurrentAuth() { accountId, user }: AuthData, @Query() filter: ScheduleFilterDto) {
    return this.service.findMany({
      user,
      filter: { accountId, entityTypeId: filter.entityTypeId },
      checkPerformers: true,
    });
  }

  @ApiOperation({ summary: 'Get schedule', description: 'Get schedule with performers' })
  @ApiParam({ name: 'scheduleId', description: 'Schedule ID', type: Number, required: true })
  @ApiOkResponse({ description: 'Schedule', type: ScheduleDto })
  @AuthDataPrefetch({ user: true })
  @Get('/:scheduleId')
  async getOne(@CurrentAuth() { accountId, user }: AuthData, @Param('scheduleId', ParseIntPipe) scheduleId: number) {
    return this.service.findOne({ user, filter: { accountId, scheduleId }, checkPerformers: true });
  }

  @ApiOperation({ summary: 'Update schedule', description: 'Update schedule with performers' })
  @ApiBody({ description: 'Data for updating schedule', type: UpdateScheduleDto })
  @ApiParam({ name: 'scheduleId', description: 'Schedule ID', type: Number, required: true })
  @ApiOkResponse({ description: 'Schedules', type: ScheduleDto })
  @UserAccess({ adminOnly: true })
  @Put('/:scheduleId')
  async update(
    @CurrentAuth() { accountId, userId }: AuthData,
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.service.update({ accountId, userId, scheduleId, dto });
  }

  @ApiOperation({ summary: 'Delete schedule', description: 'Delete schedule with performers and appointments' })
  @ApiParam({ name: 'scheduleId', description: 'Schedule ID', type: Number, required: true })
  @ApiOkResponse()
  @UserAccess({ adminOnly: true })
  @Delete('/:scheduleId')
  async delete(@CurrentAuth() { accountId, userId }: AuthData, @Param('scheduleId', ParseIntPipe) scheduleId: number) {
    return this.service.delete({ accountId, userId, scheduleId });
  }
}
